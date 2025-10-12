const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("../../router/auth");

const app = express();
app.use(cookieParser());
app.use("/auth", authRouter);

describe("POST /auth/logout", () => {
  it("should clear the jwtToken cookie and return a success message", async () => {
    const res = await request(app)
      .post("/auth/logout")
      .set("Cookie", "jwtToken=dummytoken");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Logout sucessfull" });

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.includes("jwtToken=;"))).toBe(true);
  });
});






