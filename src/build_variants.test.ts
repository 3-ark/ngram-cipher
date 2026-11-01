import { describe, it, expect } from "vitest";
import { encode as lightEncode, decode as lightDecode } from "./index.js";
import { encode as llmEncode, decode as llmDecode } from "./index.llm.js";

describe("Light Build vs LLM Build Tests", () => {
  const secret = "Top secret lightweight browser extension payload!";
  const password = "ValidPassword123#";

  it("should successfully round-trip news style using the light entry point", async () => {
    const carrier = await lightEncode(secret, password, {
      encoding: { style: "news" },
    });
    expect(typeof carrier).toBe("string");
    expect(carrier.length).toBeGreaterThan(0);

    const decrypted = await lightDecode(carrier, password, {
      encoding: { style: "news" },
    });
    expect(decrypted).toBe(secret);
  });

  it("should successfully round-trip poetry style using the light entry point", async () => {
    const carrier = await lightEncode(secret, password, {
      encoding: { style: "poetry" },
    });
    expect(typeof carrier).toBe("string");
    expect(carrier.length).toBeGreaterThan(0);

    const decrypted = await lightDecode(carrier, password, {
      encoding: { style: "poetry" },
    });
    expect(decrypted).toBe(secret);
  });

  it("should reject LLM mode in the light build with an informative error", async () => {
    await expect(
      lightEncode(secret, password, {
        encoding: { style: "llm" },
      })
    ).rejects.toThrow(/LLM steganography style requires the full LLM build/i);
  });

  it("should support encoding with the LLM entry point for standard styles as well", async () => {
    const carrier = await llmEncode(secret, password, {
      encoding: { style: "news" },
    });
    expect(typeof carrier).toBe("string");

    const decrypted = await llmDecode(carrier, password, {
      encoding: { style: "news" },
    });
    expect(decrypted).toBe(secret);
  });
});
