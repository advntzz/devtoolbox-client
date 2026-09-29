// Image Converter - Client-side image conversion, resize, compression and basic filters
export class ImageConverter {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.currentImage = null;
    this.originalImage = null;
    this.originalFile = null;
    this.showingOriginal = false;
    this.effects = {
      grayscale: false,
      sepia: false,
      invert: false,
    };
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Image Converter</h1>
          <p class="text-gray-600 dark:text-gray-300">Convert images between formats, resize, compress, and apply basic filters</p>
        </div>

        <div class="mb-6">
          <div
            class="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-blue-400 cursor-pointer transition-colors"
            id="upload-area"
            tabindex="0"
            role="button"
            aria-label="Upload image"
          >
            <input type="file" id="image-input" accept="image/*" hidden>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-400 mb-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Drop image here or click to browse</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">JPG, PNG, WebP, GIF, BMP and other browser-supported image types</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">Maximum file size: 20 MB</p>
          </div>
        </div>

        <div
          id="image-error"
          class="hidden mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300"
          role="alert"
        ></div>

        <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4" id="image-preview" hidden>
          <canvas id="preview-canvas" class="max-w-full h-auto mx-auto rounded border border-gray-200 dark:border-gray-600"></canvas>
          <div id="image-info" class="mt-4 text-sm text-gray-600 dark:text-gray-400"></div>
        </div>

        <div class="space-y-6" id="conversion-options" hidden>
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Conversion Options</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="output-format" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
                <select id="output-format" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                  <option value="bmp">BMP</option>
                </select>
              </div>

              <div>
                <label for="quality" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality: <span id="quality-display">90</span>%
                </label>
                <input type="range" id="quality" min="10" max="100" value="90" step="5" class="w-full">
                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Lower file size</span>
                  <span>Higher quality</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Resize Options</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="resize-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width (px)</label>
                <input type="number" id="resize-width" min="1" max="10000" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Auto">
              </div>
              <div>
                <label for="resize-height" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height (px)</label>
                <input type="number" id="resize-height" min="1" max="10000" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Auto">
              </div>
            </div>

            <div class="flex flex-wrap gap-4 mb-4">
              <label class="flex items-center">
                <input type="checkbox" id="maintain-aspect" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Maintain aspect ratio</span>
              </label>

              <label class="flex items-center">
                <input type="checkbox" id="resize-percentage" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Use percentage</span>
              </label>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button type="button" class="preset-btn px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-preset="thumbnail">Thumbnail (150×150)</button>
              <button type="button" class="preset-btn px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-preset="small">Small (640×480)</button>
              <button type="button" class="preset-btn px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-preset="medium">Medium (1024×768)</button>
              <button type="button" class="preset-btn px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-preset="large">Large (1920×1080)</button>
              <button type="button" class="preset-btn px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-preset="original">Original Size</button>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters & Adjustments</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="brightness" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brightness</label>
                <input type="range" id="brightness" min="-100" max="100" value="0" class="w-full">
                <span class="filter-value text-sm text-gray-600 dark:text-gray-400">0</span>
              </div>

              <div>
                <label for="contrast" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contrast</label>
                <input type="range" id="contrast" min="-100" max="100" value="0" class="w-full">
                <span class="filter-value text-sm text-gray-600 dark:text-gray-400">0</span>
              </div>

              <div>
                <label for="saturation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saturation</label>
                <input type="range" id="saturation" min="-100" max="100" value="0" class="w-full">
                <span class="filter-value text-sm text-gray-600 dark:text-gray-400">0</span>
              </div>

              <div>
                <label for="blur" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blur</label>
                <input type="range" id="blur" min="0" max="20" value="0" class="w-full">
                <span class="filter-value text-sm text-gray-600 dark:text-gray-400">0</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button type="button" class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="reset-filters">Reset Filters</button>
              <button type="button" class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="grayscale">Grayscale</button>
              <button type="button" class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="sepia">Sepia</button>
              <button type="button" class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="invert">Invert</button>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="convert">Convert & Download</button>
            <button type="button" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="reset">Reset</button>
            <button type="button" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="compare">Compare Original</button>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6" id="output-info" hidden>
          <h3 class="text-lg font-medium text-green-800 dark:text-green-200 mb-2">Conversion Result</h3>
          <div class="result-stats text-sm text-green-700 dark:text-green-300"></div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector("#preview-canvas");
    this.ctx = this.canvas.getContext("2d");
  }

  attachEventListeners() {
    const uploadArea = this.container.querySelector("#upload-area");
    const imageInput = this.container.querySelector("#image-input");

    uploadArea.addEventListener("click", () => imageInput.click());

    uploadArea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        imageInput.click();
      }
    });

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("border-blue-500");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("border-blue-500");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("border-blue-500");

      const file = Array.from(e.dataTransfer.files).find((item) =>
        item.type.startsWith("image/"),
      );
      if (file) this.handleImageUpload(file);
    });

    imageInput.addEventListener("change", (e) => {
      if (e.target.files?.length) this.handleImageUpload(e.target.files[0]);
    });

    this.container
      .querySelector("#output-format")
      .addEventListener("change", () => this.renderPreview());
    this.container.querySelector("#quality").addEventListener("input", (e) => {
      this.container.querySelector("#quality-display").textContent =
        e.target.value;
    });

    const widthInput = this.container.querySelector("#resize-width");
    const heightInput = this.container.querySelector("#resize-height");
    const maintainAspect = this.container.querySelector("#maintain-aspect");
    const percentageMode = this.container.querySelector("#resize-percentage");

    widthInput.addEventListener("input", () => {
      if (percentageMode.checked) return;

      const width = Number(widthInput.value);
      if (maintainAspect.checked && this.currentImage && width > 0) {
        heightInput.value = Math.max(
          1,
          Math.round(
            (width * this.currentImage.height) / this.currentImage.width,
          ),
        );
      }
      this.renderPreview();
    });

    heightInput.addEventListener("input", () => {
      if (percentageMode.checked) return;

      const height = Number(heightInput.value);
      if (maintainAspect.checked && this.currentImage && height > 0) {
        widthInput.value = Math.max(
          1,
          Math.round(
            (height * this.currentImage.width) / this.currentImage.height,
          ),
        );
      }
      this.renderPreview();
    });

    percentageMode.addEventListener("change", () => {
      const width = this.container.querySelector("#resize-width");
      const height = this.container.querySelector("#resize-height");

      if (percentageMode.checked && this.currentImage) {
        width.value = 100;
        height.value = 100;
        width.placeholder = "Percent";
        height.placeholder = "Percent";
      } else if (this.currentImage) {
        width.placeholder = "Auto";
        height.placeholder = "Auto";
        width.value = this.currentImage.width;
        height.value = this.currentImage.height;
      }

      this.renderPreview();
    });

    this.container.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.applyPreset(btn.dataset.preset));
    });

    ["brightness", "contrast", "saturation", "blur"].forEach((filter) => {
      const slider = this.container.querySelector(`#${filter}`);
      const display = slider.parentElement.querySelector(".filter-value");

      slider.addEventListener("input", (e) => {
        display.textContent = e.target.value;
        this.renderPreview();
      });
    });

    this.container
      .querySelector('[data-action="reset-filters"]')
      .addEventListener("click", () => this.resetFilters());
    this.container
      .querySelector('[data-action="grayscale"]')
      .addEventListener("click", () => this.toggleEffect("grayscale"));
    this.container
      .querySelector('[data-action="sepia"]')
      .addEventListener("click", () => this.toggleEffect("sepia"));
    this.container
      .querySelector('[data-action="invert"]')
      .addEventListener("click", () => this.toggleEffect("invert"));

    this.container
      .querySelector('[data-action="convert"]')
      .addEventListener("click", () => this.convertAndDownload());
    this.container
      .querySelector('[data-action="reset"]')
      .addEventListener("click", () => this.reset());
    this.container
      .querySelector('[data-action="compare"]')
      .addEventListener("click", () => this.toggleComparison());
  }

  handleImageUpload(file) {
    this.clearError();

    if (!file.type.startsWith("image/")) {
      this.showError("Please select a valid image file.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      this.showError(
        "Image is too large. Maximum supported file size is 20 MB.",
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        this.originalFile = file;
        this.originalImage = img;
        this.currentImage = img;
        this.showingOriginal = false;
        this.resetFilterState(false);

        this.container.querySelector("#image-preview").hidden = false;
        this.container.querySelector("#conversion-options").hidden = false;

        this.container.querySelector("#resize-width").value = img.width;
        this.container.querySelector("#resize-height").value = img.height;

        this.updateImageInfo(file, img);
        this.renderPreview();
      };

      img.onerror = () => {
        this.showError(
          "The selected image could not be decoded by this browser.",
        );
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      this.showError("Failed to read the image file.");
    };

    reader.readAsDataURL(file);
  }

  updateImageInfo(file, img) {
    const info = this.container.querySelector("#image-info");
    const size = this.formatBytes(file.size);

    info.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div><strong>Original:</strong> ${img.width} × ${img.height}px</div>
        <div><strong>Size:</strong> ${size}</div>
        <div><strong>Type:</strong> ${this.escapeHtml(file.type || "Unknown")}</div>
      </div>
    `;
  }

  applyPreset(preset) {
    if (!this.originalImage) return;

    const widthInput = this.container.querySelector("#resize-width");
    const heightInput = this.container.querySelector("#resize-height");
    const percentageMode = this.container.querySelector("#resize-percentage");

    percentageMode.checked = false;
    widthInput.placeholder = "Auto";
    heightInput.placeholder = "Auto";

    const presets = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 640, height: 480 },
      medium: { width: 1024, height: 768 },
      large: { width: 1920, height: 1080 },
      original: {
        width: this.originalImage.width,
        height: this.originalImage.height,
      },
    };

    const selected = presets[preset];
    if (!selected) return;

    widthInput.value = selected.width;
    heightInput.value = selected.height;

    this.renderPreview();
  }

  getOutputDimensions() {
    if (!this.originalImage) return { width: 1, height: 1 };

    const percentageMode =
      this.container.querySelector("#resize-percentage").checked;
    const maintainAspect =
      this.container.querySelector("#maintain-aspect").checked;
    const widthValue = Number(
      this.container.querySelector("#resize-width").value,
    );
    const heightValue = Number(
      this.container.querySelector("#resize-height").value,
    );

    if (percentageMode) {
      const percentage = Math.min(1000, Math.max(1, widthValue || 100));
      return {
        width: Math.max(
          1,
          Math.round((this.originalImage.width * percentage) / 100),
        ),
        height: Math.max(
          1,
          Math.round(
            (this.originalImage.height *
              (maintainAspect ? percentage : heightValue || percentage)) /
              100,
          ),
        ),
      };
    }

    let width = widthValue || this.originalImage.width;
    let height = heightValue || this.originalImage.height;

    width = Math.min(10000, Math.max(1, Math.round(width)));
    height = Math.min(10000, Math.max(1, Math.round(height)));

    if (maintainAspect) {
      const aspect = this.originalImage.width / this.originalImage.height;

      if (widthValue && !heightValue) {
        height = Math.max(1, Math.round(width / aspect));
      } else if (heightValue && !widthValue) {
        width = Math.max(1, Math.round(height * aspect));
      } else if (widthValue && heightValue) {
        const scale = Math.min(
          width / this.originalImage.width,
          height / this.originalImage.height,
        );
        width = Math.max(1, Math.round(this.originalImage.width * scale));
        height = Math.max(1, Math.round(this.originalImage.height * scale));
      }
    }

    return { width, height };
  }

  getFilterString() {
    const brightness = Number(
      this.container.querySelector("#brightness").value,
    );
    const contrast = Number(this.container.querySelector("#contrast").value);
    const saturation = Number(
      this.container.querySelector("#saturation").value,
    );
    const blur = Number(this.container.querySelector("#blur").value);

    const filters = [];

    if (brightness !== 0)
      filters.push(`brightness(${Math.max(0, 100 + brightness)}%)`);
    if (contrast !== 0)
      filters.push(`contrast(${Math.max(0, 100 + contrast)}%)`);
    if (saturation !== 0)
      filters.push(`saturate(${Math.max(0, 100 + saturation)}%)`);
    if (blur > 0) filters.push(`blur(${Math.min(20, blur)}px)`);
    if (this.effects.grayscale) filters.push("grayscale(100%)");
    if (this.effects.sepia) filters.push("sepia(100%)");
    if (this.effects.invert) filters.push("invert(100%)");

    return filters.length ? filters.join(" ") : "none";
  }

  renderPreview() {
    if (!this.currentImage || !this.canvas || !this.ctx) return;

    const { width, height } = this.getOutputDimensions();

    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.filter = this.getFilterString();
    this.ctx.drawImage(this.currentImage, 0, 0, width, height);
    this.ctx.filter = "none";

    this.showingOriginal = false;
  }

  toggleEffect(effect) {
    if (!this.currentImage) return;

    this.effects[effect] = !this.effects[effect];
    this.renderPreview();
  }

  resetFilters() {
    this.resetFilterState(true);
  }

  resetFilterState(render) {
    this.effects = {
      grayscale: false,
      sepia: false,
      invert: false,
    };

    ["brightness", "contrast", "saturation", "blur"].forEach((filter) => {
      const slider = this.container.querySelector(`#${filter}`);
      if (!slider) return;
      slider.value = 0;
      const display = slider.parentElement.querySelector(".filter-value");
      if (display) display.textContent = "0";
    });

    if (render) this.renderPreview();
  }

  toggleComparison() {
    if (!this.originalImage || !this.canvas) return;

    if (this.showingOriginal) {
      this.renderPreview();
      this.container.querySelector('[data-action="compare"]').textContent =
        "Compare Original";
      return;
    }

    this.canvas.width = this.originalImage.width;
    this.canvas.height = this.originalImage.height;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.filter = "none";
    this.ctx.drawImage(this.originalImage, 0, 0);
    this.showingOriginal = true;
    this.container.querySelector('[data-action="compare"]').textContent =
      "Show Converted";
  }

  async convertAndDownload() {
    if (!this.currentImage) return;

    this.clearError();

    try {
      const format = this.container.querySelector("#output-format").value;
      const quality =
        Number(this.container.querySelector("#quality").value) / 100;
      const { width, height } = this.getOutputDimensions();

      const renderCanvas = document.createElement("canvas");
      renderCanvas.width = width;
      renderCanvas.height = height;

      const renderCtx = renderCanvas.getContext("2d");
      if (!renderCtx)
        throw new Error("Canvas rendering is not available in this browser.");

      renderCtx.clearRect(0, 0, width, height);

      if (format === "jpeg" || format === "bmp") {
        renderCtx.fillStyle = "#ffffff";
        renderCtx.fillRect(0, 0, width, height);
      }

      renderCtx.filter = this.getFilterString();
      renderCtx.drawImage(this.currentImage, 0, 0, width, height);
      renderCtx.filter = "none";

      let blob;
      let extension = format;

      if (format === "bmp") {
        blob = this.canvasToBmpBlob(renderCanvas, renderCtx);
      } else {
        const mimeType = {
          jpeg: "image/jpeg",
          png: "image/png",
          webp: "image/webp",
        }[format];

        blob = await this.canvasToBlob(renderCanvas, mimeType, quality);

        if (format === "webp" && blob.type !== "image/webp") {
          throw new Error("WebP output is not supported by this browser.");
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `converted-image.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      this.showResultInfo(blob.size, width, height, format);
    } catch (error) {
      this.showError(error?.message || "Image conversion failed.");
    }
  }

  canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error(`Could not create ${mimeType} output.`));
        },
        mimeType,
        quality,
      );
    });
  }

  canvasToBmpBlob(canvas, ctx) {
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const rowSize = Math.ceil((width * 3) / 4) * 4;
    const pixelDataSize = rowSize * height;
    const fileSize = 54 + pixelDataSize;
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // BMP file header
    view.setUint8(0, 0x42);
    view.setUint8(1, 0x4d);
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, 54, true);

    // DIB header
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, pixelDataSize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    let offset = 54;

    // BMP stores rows bottom-to-top and pixels as BGR.
    for (let y = height - 1; y >= 0; y--) {
      const rowStart = y * width * 4;
      const rowEnd = offset + rowSize;

      for (let x = 0; x < width; x++) {
        const source = rowStart + x * 4;
        view.setUint8(offset++, pixels[source + 2]);
        view.setUint8(offset++, pixels[source + 1]);
        view.setUint8(offset++, pixels[source]);
      }

      while (offset < rowEnd) view.setUint8(offset++, 0);
    }

    return new Blob([buffer], { type: "image/bmp" });
  }

  showResultInfo(newSize, width, height, format) {
    const info = this.container.querySelector("#output-info");
    const stats = info.querySelector(".result-stats");
    const originalSize = this.originalFile?.size || 0;

    let reductionText = "—";
    if (originalSize > 0) {
      const reduction = (1 - newSize / originalSize) * 100;
      reductionText =
        reduction > 0
          ? `${reduction.toFixed(1)}% smaller`
          : `${Math.abs(reduction).toFixed(1)}% larger`;
    }

    stats.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div><strong>Format:</strong> ${this.escapeHtml(format.toUpperCase())}</div>
        <div><strong>Dimensions:</strong> ${width} × ${height}px</div>
        <div><strong>Output Size:</strong> ${this.formatBytes(newSize)}</div>
        <div><strong>Compared to Original:</strong> ${reductionText}</div>
      </div>
    `;

    info.hidden = false;
  }

  reset() {
    this.currentImage = null;
    this.originalImage = null;
    this.originalFile = null;
    this.showingOriginal = false;

    this.container.querySelector("#image-preview").hidden = true;
    this.container.querySelector("#conversion-options").hidden = true;
    this.container.querySelector("#output-info").hidden = true;
    this.container.querySelector("#image-input").value = "";

    this.container.querySelector("#resize-width").value = "";
    this.container.querySelector("#resize-height").value = "";
    this.container.querySelector("#resize-percentage").checked = false;
    this.container.querySelector("#resize-width").placeholder = "Auto";
    this.container.querySelector("#resize-height").placeholder = "Auto";

    this.resetFilterState(false);
    this.clearError();

    const compareButton = this.container.querySelector(
      '[data-action="compare"]',
    );
    if (compareButton) compareButton.textContent = "Compare Original";

    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  showError(message) {
    const error = this.container.querySelector("#image-error");
    error.textContent = message;
    error.classList.remove("hidden");
  }

  clearError() {
    const error = this.container?.querySelector("#image-error");
    if (!error) return;
    error.textContent = "";
    error.classList.add("hidden");
  }

  formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
  }

  escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }
}
