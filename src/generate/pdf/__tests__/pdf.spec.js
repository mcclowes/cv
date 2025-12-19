import generatePdf from "../index.js";

// Mock the html generator
jest.mock("../../html/index.js", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue("<html><body>Test CV</body></html>"),
}));

// Mock playwright
const mockPdf = jest.fn().mockResolvedValue(Buffer.from("pdf content"));
const mockSetContent = jest.fn().mockResolvedValue(undefined);
const mockEmulateMedia = jest.fn().mockResolvedValue(undefined);
const mockNewPage = jest.fn().mockResolvedValue({
  setContent: mockSetContent,
  emulateMedia: mockEmulateMedia,
  pdf: mockPdf,
});
const mockClose = jest.fn().mockResolvedValue(undefined);
const mockLaunch = jest.fn().mockResolvedValue({
  newPage: mockNewPage,
  close: mockClose,
});

// Mock both playwright and playwright-core since the code tries playwright-core first
jest.mock("playwright-core", () => ({
  chromium: {
    launch: () => mockLaunch(),
  },
}));

jest.mock("playwright", () => ({
  chromium: {
    launch: () => mockLaunch(),
  },
}));

describe("generatePdf", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console output during tests
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it("generates PDF with default options", async () => {
    const content = ["./test.md"];
    const destination = "./test.pdf";
    const options = {};

    await generatePdf(content, destination, options);

    expect(mockLaunch).toHaveBeenCalled();
    expect(mockNewPage).toHaveBeenCalled();
    expect(mockSetContent).toHaveBeenCalledWith("<html><body>Test CV</body></html>", {
      waitUntil: "networkidle",
    });
    expect(mockEmulateMedia).toHaveBeenCalledWith({ media: "screen" });
    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "A4",
        path: destination,
        printBackground: true,
      }),
    );
    expect(mockClose).toHaveBeenCalled();
  });

  it("uses default destination when none provided", async () => {
    await generatePdf(["./test.md"], undefined, {});

    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "./output.pdf",
      }),
    );
  });

  it("merges custom PDF options", async () => {
    const options = {
      pdfOptions: {
        format: "Letter",
        landscape: true,
      },
    };

    await generatePdf(["./test.md"], "./custom.pdf", options);

    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "Letter",
        landscape: true,
        path: "./custom.pdf",
      }),
    );
  });

  it("closes browser even on error", async () => {
    mockPdf.mockRejectedValueOnce(new Error("PDF generation failed"));

    await expect(generatePdf(["./test.md"], "./test.pdf", {})).rejects.toThrow(
      "PDF generation failed",
    );

    expect(mockClose).toHaveBeenCalled();
  });

  it("logs progress messages", async () => {
    await generatePdf(["./test.md"], "./test.pdf", {});

    expect(console.log).toHaveBeenCalledWith("Starting PDF generation...");
    expect(console.log).toHaveBeenCalledWith("Creating PDF with options:", expect.any(Object));
    expect(console.log).toHaveBeenCalledWith("./test.pdf generated");
  });
});

describe("generatePdf error handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it("logs helpful message when browser executable is missing", async () => {
    const executableError = new Error(
      "browserType.launch: Executable doesn't exist at /path/to/chromium",
    );
    mockLaunch.mockRejectedValueOnce(executableError);

    await expect(generatePdf(["./test.md"], "./test.pdf", {})).rejects.toThrow(
      "Executable doesn't exist",
    );

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Playwright browser is not installed"),
    );
  });

  it("rethrows non-executable errors without special message", async () => {
    const networkError = new Error("Network timeout");
    mockLaunch.mockRejectedValueOnce(networkError);

    await expect(generatePdf(["./test.md"], "./test.pdf", {})).rejects.toThrow("Network timeout");
  });
});
