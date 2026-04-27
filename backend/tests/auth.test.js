const request = require("supertest");
const app = require("../index");

describe("Auth API", () => {
  test("should reject invalid student email domain on register", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@gmail.com",
        password: "12345678"
      });

    expect(res.statusCode).toBe(400);
  });

  test("should reject weak password on register", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@student.university.edu",
        password: "123"
      });

    expect(res.statusCode).toBe(400);
  });
});