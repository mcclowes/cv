import generatePdfFromHtml from "../index.js";

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

const HTML = "<html><body>Test CV</body></html>";

describe("generatePdfFromHtml", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it("generates PDF with default options", async () => {
    await generatePdfFromHtml(HTML, "./test.pdf", {});

    expect(mockLaunch).toHaveBeenCalled();
    expect(mockNewPage).toHaveBeenCalled();
    expect(mockSetContent).toHaveBeenCalledWith(HTML, {
      waitUntil: "networkidle",
    });
    expect(mockEmulateMedia).toHaveBeenCalledWith({ media: "screen" });
    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "A4",
        path: "./test.pdf",
        printBackground: true,
      }),
    );
    expect(mockClose).toHaveBeenCalled();
  });

  it("uses default destination when none provided", async () => {
    await generatePdfFromHtml(HTML, undefined, {});

    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "./output.pdf",
      }),
    );
  });

  it("merges custom PDF options", async () => {
    await generatePdfFromHtml(HTML, "./custom.pdf", {
      pdfOptions: {
        format: "Letter",
        landscape: true,
      },
    });

    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "Letter",
        landscape: true,
        path: "./custom.pdf",
      }),
    );
  });

  it("applies PDF metadata from meta.name and meta.description", async () => {
    await generatePdfFromHtml(HTML, "./meta.pdf", {
      meta: { name: "Jane Doe", description: "A summary" },
    });

    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Jane Doe CV",
        author: "Jane Doe",
        subject: "A summary",
      }),
    );
  });

  it("closes browser even on error", async () => {
    mockPdf.mockRejectedValueOnce(new Error("PDF generation failed"));

    await expect(generatePdfFromHtml(HTML, "./test.pdf", {})).rejects.toThrow(
      "PDF generation failed",
    );

    expect(mockClose).toHaveBeenCalled();
  });
});

describe("generatePdfFromHtml error handling", () => {
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

    await expect(generatePdfFromHtml(HTML, "./test.pdf", {})).rejects.toThrow(
      "Executable doesn't exist",
    );

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Playwright browser is not installed"),
    );
  });

  it("rethrows non-executable errors without special message", async () => {
    const networkError = new Error("Network timeout");
    mockLaunch.mockRejectedValueOnce(networkError);

    await expect(generatePdfFromHtml(HTML, "./test.pdf", {})).rejects.toThrow("Network timeout");
  });
});
