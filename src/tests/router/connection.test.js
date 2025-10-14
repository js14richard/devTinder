const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");

jest.mock("../../models/user");
jest.mock("../../models/connectionRequest");
jest.mock("../../middlewares/auth");

const { User } = require("../../models/user");
const { ConnectionRequest } = require("../../models/connectionRequest");
const { userAuth } = require("../../middlewares/auth");
const connectionRouter = require("../../router/connection");

const app = express();
app.use(express.json());
app.use("/connection", connectionRouter);

describe("Connection Router", () => {
  let mockUser;
  let mockReceiver;
  let mockRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      firstName: "Siril",
    };

    mockReceiver = {
      _id: new mongoose.Types.ObjectId(),
      firstName: "Rohit",
    };

    mockRequest = {
      _id: new mongoose.Types.ObjectId(),
      connectionSenderId: mockUser._id,
      connectionReceiverId: mockReceiver._id,
      connectionRequestStatus: "interested",
      save: jest.fn().mockResolvedValue(true),
    };

    userAuth.mockImplementation((req, res, next) => {
      req.currentUser = mockUser;
      next();
    });
  });

  // ---------------- SEND REQUEST ROUTE ----------------
  describe("POST /connection/send/request/:status/:connectionReceiverId", () => {
    test("should return 400 for invalid status", async () => {
      const res = await request(app)
        .post(`/connection/send/request/invalid/${mockReceiver._id}`)
        .set("Authorization", "Bearer token");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid request status");
    });

    test("should return 400 if receiver not found", async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post(`/connection/send/request/interested/${mockReceiver._id}`)
        .set("Authorization", "Bearer token");

      expect(User.findById).toHaveBeenCalled();
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid connection receiver");
    });

    test("should return 400 if connection request already exists", async () => {
      User.findById.mockResolvedValue(mockReceiver);
      ConnectionRequest.findOne.mockResolvedValue({ _id: "existingId" });

      const res = await request(app)
        .post(`/connection/send/request/interested/${mockReceiver._id}`)
        .set("Authorization", "Bearer token");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Connection request already exists");
    });

    test("should send new connection request successfully", async () => {
      User.findById.mockResolvedValue(mockReceiver);
      ConnectionRequest.findOne.mockResolvedValue(null);
      ConnectionRequest.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockRequest),
      }));

      const res = await request(app)
        .post(`/connection/send/request/interested/${mockReceiver._id}`)
        .set("Authorization", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("interested");
      expect(res.body.data).toBeTruthy();
    });
  });

  // ---------------- REVIEW REQUEST ROUTE ----------------
  describe("POST /connection/request/review/:status/:requestId", () => {
    test("should return 400 for invalid status", async () => {
      const res = await request(app)
        .post(`/connection/request/review/invalid/${mockRequest._id}`)
        .set("Authorization", "Bearer token");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid status to review");
    });

    test("should return 400 for invalid requestId", async () => {
      const res = await request(app)
        .post(`/connection/request/review/accepted/invalidId`)
        .set("Authorization", "Bearer token");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid request Id");
    });

    test("should return 404 if connection request not found", async () => {
      ConnectionRequest.findOne.mockResolvedValue(null);
      const res = await request(app)
        .post(`/connection/request/review/accepted/${mockRequest._id}`)
        .set("Authorization", "Bearer token");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Connection request not found");
    });

    test("should successfully review and update request", async () => {
  const populatedConnection = {
    _id: mockRequest._id,
    connectionSenderId: { firstName: "Jane" },
    connectionRequestStatus: "interested",
    save: jest.fn().mockResolvedValue({
      ...mockRequest,
      connectionRequestStatus: "accepted"
    }),
  };

  ConnectionRequest.findOne.mockReturnValue({
    populate: jest.fn().mockResolvedValue(populatedConnection),
  });

  const res = await request(app)
    .post(`/connection/request/review/accepted/${mockRequest._id}`)
    .set("Authorization", "Bearer token");

  expect(res.status).toBe(200);
  expect(res.body.message).toContain("has accepted");
  expect(res.body.data).toBeTruthy();
});
  });
});
