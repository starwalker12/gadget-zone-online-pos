import { customerSchema } from "../customers";

describe("customerSchema validation", () => {
  it("should validate a valid minimal customer", () => {
    const validData = {
      name: "John Doe",
    };
    const result = customerSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "John Doe",
        credit_limit: 0,
        is_archived: false,
      });
    }
  });

  it("should validate a full customer", () => {
    const validData = {
      name: "Jane Smith",
      phone: "1234567890",
      email: "jane@example.com",
      address: "123 Main St",
      notes: "VIP customer",
      credit_limit: 1000,
      is_archived: true,
    };
    const result = customerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should trim whitespace from name", () => {
    const data = { name: "   John Doe   " };
    const result = customerSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
    }
  });

  it("should fail if name is empty or just whitespace", () => {
    const emptyName = customerSchema.safeParse({ name: "" });
    expect(emptyName.success).toBe(false);

    const spaceName = customerSchema.safeParse({ name: "   " });
    expect(spaceName.success).toBe(false);
  });

  it("should fail if name exceeds 160 characters", () => {
    const longName = "A".repeat(161);
    const result = customerSchema.safeParse({ name: longName });
    expect(result.success).toBe(false);
  });

  it("should handle optionalString correctly", () => {
    // optional strings are trimmed and if empty string, it fails min(1) constraint
    // But actually optionalString preprocess doesn't convert empty string to undefined.
    // Let's check how optionalString behaves
    const result = customerSchema.safeParse({ name: "A", phone: "  123  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("123");
    }
  });

  it("should handle empty strings for optionalString gracefully", () => {
    // If phone is an empty string, does it pass?
    const result = customerSchema.safeParse({ name: "A", phone: "" });
    // preprocess doesn't handle empty string specifically for optionalString, so it passes "" to min(1) which fails
    expect(result.success).toBe(false);
  });

  it("should trim and handle optionalEmail correctly", () => {
    const valid = customerSchema.safeParse({ name: "A", email: "  test@example.com  " });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe("test@example.com");
    }

    const empty = customerSchema.safeParse({ name: "A", email: "" });
    expect(empty.success).toBe(true);
    if (empty.success) {
      expect(empty.data.email).toBeUndefined();
    }

    const nullEmail = customerSchema.safeParse({ name: "A", email: null });
    expect(nullEmail.success).toBe(true);
    if (nullEmail.success) {
      expect(nullEmail.data.email).toBeNull();
    }
  });

  it("should fail on invalid email", () => {
    const result = customerSchema.safeParse({ name: "A", email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("should coerce credit_limit correctly", () => {
    const resultStr = customerSchema.safeParse({ name: "A", credit_limit: "500" });
    expect(resultStr.success).toBe(true);
    if (resultStr.success) {
      expect(resultStr.data.credit_limit).toBe(500);
    }

    const resultZero = customerSchema.safeParse({ name: "A", credit_limit: 0 });
    expect(resultZero.success).toBe(true);

    const resultNeg = customerSchema.safeParse({ name: "A", credit_limit: -1 });
    expect(resultNeg.success).toBe(false);

    const resultInvalid = customerSchema.safeParse({ name: "A", credit_limit: "abc" });
    expect(resultInvalid.success).toBe(false);
  });

  it("should handle boolish for is_archived", () => {
    const truthyValues = ["true", "on", true];
    truthyValues.forEach((val) => {
      const res = customerSchema.safeParse({ name: "A", is_archived: val });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.is_archived).toBe(true);
      }
    });

    const falsyValues = ["false", "off", false, undefined, null, ""];
    falsyValues.forEach((val) => {
      const res = customerSchema.safeParse({ name: "A", is_archived: val });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.is_archived).toBe(false);
      }
    });

    // Any other values will be casted using Boolean(v)
    const otherVal = customerSchema.safeParse({ name: "A", is_archived: "anything_else" });
    expect(otherVal.success).toBe(true);
    if(otherVal.success) {
        expect(otherVal.data.is_archived).toBe(true); // Boolean("anything_else") is true
    }
  });
});
