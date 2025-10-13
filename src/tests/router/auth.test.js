const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");

jest.mock("../../models/user");
jest.mock("../../utils/validations");

const { User } = require("../../models/user");
const { validateSignupData } = require("../../utils/validations");

const authRouter = require("../../router/auth");

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("Auth Router", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- SIGNUP ----------------
  describe("POST /auth/signup", () => {

    it("should return 400 if user already exists", async () => {
      User.findOne.mockResolvedValue({ email: "already_there@example.com" });

      const res = await request(app)
        .post("/auth/signup")
        .send({
          firstName: "Siril",
          lastName: "Richard",
          email: "already_there@example.com",
          password: "pass123",
          age: 23
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });

    it("should create user successfully", async () => {
      validateSignupData.mockReturnValue(true);
      User.findOne.mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
      User.prototype.save = jest.fn().mockResolvedValue(true);

      const res = await request(app)
        .post("/auth/signup")
        .send({
          firstName: "Siril",
          lastName: "Richard",
          email: "siril@example.com",
          password: "123456",
          age: 23
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User signed up successfully");
      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
    });

    it("should handle signup validation error", async () => {
      validateSignupData.mockImplementation(() => {
        throw new Error("Invalid input");
      });

      const res = await request(app)
        .post("/auth/signup")
        .send({});

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toMatch(/Error signing up user/);
    });
  });

  // ---------------- LOGIN ----------------
  describe("POST /auth/login", () => {
  it("should return 400 if email or password missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com" }); // no password

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Bad request");
  });

  it("should return 401 if user not found", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nouser@example.com", password: "1234" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should return 401 if password not match", async () => {
    const mockUser = { isPasswordMatch: jest.fn().mockResolvedValue(false) };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "siril@example.com", password: "wrong" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should login successfully and set cookie", async () => {
    const mockUser = {
      isPasswordMatch: jest.fn().mockResolvedValue(true),
      getJWT: jest.fn().mockResolvedValue("fake-jwt-token"),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "siril@example.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successfull");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should handle server error during login", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("DB failure")),
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "siril@example.com", password: "123456" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Something went wrong/);
  });
});


  // ---------------- LOGOUT ---------------- //
  describe("POST /auth/logout", () => {

    it("should clear jwtToken cookie and return success message", async () => {
      const res = await request(app)
        .post("/auth/logout");

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Logout sucessfull");
    });
  });
});
