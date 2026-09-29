import figlet from "figlet";
import standardFont from "figlet/fonts/Standard";
import bigFont from "figlet/fonts/Big";
import blockFont from "figlet/fonts/Block";
import bubbleFont from "figlet/fonts/Bubble";
import digitalFont from "figlet/fonts/Digital";
import ivritFont from "figlet/fonts/Ivrit";
import leanFont from "figlet/fonts/Lean";
import scriptFont from "figlet/fonts/Script";
import shadowFont from "figlet/fonts/Shadow";
import slantFont from "figlet/fonts/Slant";

const FIGLET_FONTS = {
  standard: ["Standard", standardFont],
  big: ["Big", bigFont],
  block: ["Block", blockFont],
  bubble: ["Bubble", bubbleFont],
  digital: ["Digital", digitalFont],
  ivrit: ["Ivrit", ivritFont],
  lean: ["Lean", leanFont],
  script: ["Script", scriptFont],
  shadow: ["Shadow", shadowFont],
  slant: ["Slant", slantFont],
};

Object.values(FIGLET_FONTS).forEach(([name, fontData]) => {
  figlet.parseFont(name, fontData);
});

figlet.defaults({
  fetchFontIfMissing: false,
});

export class ASCIIArtGenerator {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.asciiOutput = null;
    this.sourceImage = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
    this.generateFromText("ASCII");
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">ASCII Art Generator</h1>
          <p class="text-gray-600 dark:text-gray-300">Create ASCII art from text, images, and shapes</p>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-6">
          <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn active" data-type="text">Text Art</button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn" data-type="image">Image to ASCII</button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn" data-type="shapes">Shapes</button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn" data-type="banner">Banner</button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn" data-type="table">Table</button>
        </div>
        
        <div class="mb-6">
          <div id="input-text" class="input-panel active">
            <label for="text-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter Text</label>
            <input 
              type="text" 
              id="text-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
              placeholder="Enter text to convert..."
              value="ASCII"
            />
            
            <label for="font-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Font Style</label>
            <select id="font-select" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="standard">Standard</option>
              <option value="big">Big</option>
              <option value="block">Block</option>
              <option value="bubble">Bubble</option>
              <option value="digital">Digital</option>
              <option value="ivrit">Ivrit</option>
              <option value="lean">Lean</option>
              <option value="script">Script</option>
              <option value="shadow">Shadow</option>
              <option value="slant">Slant</option>
            </select>
          </div>
          
          <div id="input-image" class="input-panel hidden">
            <label for="image-upload" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Image</label>
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <div class="mt-4 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-blue-400 cursor-pointer" id="upload-area">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p class="mt-2 text-gray-600 dark:text-gray-400">Drop image here or click to upload</p>
            </div>
            
            <canvas id="image-canvas" width="200" height="200" hidden></canvas>
            
            <div class="mt-4 space-y-4">
              <div>
                <label for="ascii-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width: <span id="width-display">80</span> chars</label>
                <input type="range" id="ascii-width" min="40" max="200" value="80" step="10" class="w-full" />
              </div>
              
              <div>
                <label for="char-set" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Character Set</label>
                <select id="char-set" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                  <option value="blocks">Blocks</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
              
              <label class="flex items-center">
                <input type="checkbox" id="invert-chars" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Invert (for dark backgrounds)</span>
              </label>
            </div>
          </div>
          
          <div id="input-shapes" class="input-panel hidden">
            <label for="shape-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Shape</label>
            <select id="shape-select" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="rectangle">Rectangle</option>
              <option value="triangle">Triangle</option>
              <option value="circle">Circle</option>
              <option value="diamond">Diamond</option>
              <option value="star">Star</option>
              <option value="heart">Heart</option>
              <option value="arrow">Arrow</option>
              <option value="tree">Tree</option>
            </select>
            
            <div class="mt-4 space-y-4">
              <div>
                <label for="shape-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width: <span id="shape-width-display">20</span></label>
                <input type="range" id="shape-width" min="5" max="50" value="20" class="w-full" />
              </div>
              
              <div>
                <label for="shape-height" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height: <span id="shape-height-display">10</span></label>
                <input type="range" id="shape-height" min="5" max="30" value="10" class="w-full" />
              </div>
              
              <div>
                <label for="shape-char" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fill Character</label>
                <input type="text" id="shape-char" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" value="*" maxlength="1" />
              </div>
            </div>
          </div>
          
          <div id="input-banner" class="input-panel hidden">
            <label for="banner-text" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Text</label>
            <input 
              type="text" 
              id="banner-text" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
              placeholder="Enter banner text..."
              value="WELCOME"
            />
            
            <label for="banner-style" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Banner Style</label>
            <select id="banner-style" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="simple">Simple</option>
              <option value="double">Double Line</option>
              <option value="ascii">ASCII Border</option>
              <option value="stars">Stars</option>
              <option value="dashed">Dashed</option>
            </select>
            
            <div class="mt-4">
              <label for="banner-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width: <span id="banner-width-display">60</span></label>
              <input type="range" id="banner-width" min="30" max="100" value="60" class="w-full" />
            </div>
          </div>
          
          <div id="input-table" class="input-panel hidden">
            <label for="table-data" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Table Data (CSV format)</label>
            <textarea 
              id="table-data" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
              placeholder="Header1,Header2,Header3&#10;Data1,Data2,Data3"
              rows="5"
            >Name,Age,City
John Doe,30,New York
Jane Smith,25,Los Angeles
Bob Johnson,35,Chicago</textarea>
            
            <label for="table-style" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Table Style</label>
            <select id="table-style" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="simple">Simple</option>
              <option value="grid">Grid</option>
              <option value="pipe">Pipe</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        </div>
        
        <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">ASCII Art Output</h3>
            <div class="flex gap-2">
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-action="copy" title="Copy ASCII Art">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-action="download" title="Download as Text">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            </div>
          </div>
          <pre id="ascii-output" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-4 font-mono text-sm overflow-auto max-h-96"></pre>
          <div class="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span id="output-lines">0 lines</span>
            <span id="output-chars">0 characters</span>
          </div>
        </div>
        
        <div class="flex gap-3 mb-6">
          <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Generate ASCII Art
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="clear">Clear</button>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Quick Examples</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="smiley">Smiley Face</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="cat">Cat</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="coffee">Coffee Cup</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="computer">Computer</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="music">Music Note</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="rocket">Rocket</button>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector("#image-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.asciiOutput = this.container.querySelector("#ascii-output");
  }

  attachEventListeners() {
    // Type selector
    this.container.querySelectorAll(".type-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.selectType(btn.dataset.type));
    });

    // Generate button
    this.container
      .querySelector('[data-action="generate"]')
      .addEventListener("click", () => this.generateArt());

    // Clear button
    this.container
      .querySelector('[data-action="clear"]')
      .addEventListener("click", () => this.clear());

    // Copy button
    this.container
      .querySelector('[data-action="copy"]')
      .addEventListener("click", () => this.copyArt());

    // Download button
    this.container
      .querySelector('[data-action="download"]')
      .addEventListener("click", () => this.downloadArt());

    // Image upload
    const imageUpload = this.container.querySelector("#image-upload");
    const uploadArea = this.container.querySelector("#upload-area");

    imageUpload.addEventListener("change", (e) => this.handleImageUpload(e));

    uploadArea.addEventListener("click", () => imageUpload.click());

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        this.handleImageFile(e.dataTransfer.files[0]);
      }
    });

    // Range inputs
this.container.querySelectorAll('input[type="range"]').forEach((range) => {
  const display = this.container.querySelector(`#${range.id}-display`);

  if (display) {
    range.addEventListener("input", () => {
      display.textContent = range.value;
    });
  }
});

    // Examples
    this.container.querySelectorAll("[data-example]").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.loadExample(btn.dataset.example),
      );
    });

    // Auto-generate for text input
    this.container
      .querySelector("#text-input")
      .addEventListener("input", () => {
        clearTimeout(this.generateTimeout);
        this.generateTimeout = setTimeout(() => this.generateArt(), 500);
      });

    this.container
      .querySelectorAll(
        "#font-select, #ascii-width, #char-set, #invert-chars, #shape-select, #shape-width, #shape-height, #shape-char, #banner-text, #banner-style, #banner-width, #table-data, #table-style",
      )
      .forEach((element) => {
        element.addEventListener("input", () => {
          clearTimeout(this.generateTimeout);

          this.generateTimeout = setTimeout(() => {
            if (
              element.id === "ascii-width" &&
              this.sourceImage &&
              !this.canvas.hidden
            ) {
              this.processImage(this.sourceImage);
            } else {
              this.generateArt();
            }
          }, 150);
        });

        element.addEventListener("change", () => {
          if (
            element.id === "ascii-width" &&
            this.sourceImage &&
            !this.canvas.hidden
          ) {
            this.processImage(this.sourceImage);
          } else {
            this.generateArt();
          }
        });
      });
  }

  selectType(type) {
    // Update buttons
    this.container.querySelectorAll(".type-btn").forEach((btn) => {
      const isActive = btn.dataset.type === type;
      if (isActive) {
        btn.className =
          "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn active";
      } else {
        btn.className =
          "px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn";
      }
    });

    // Update panels
    this.container.querySelectorAll(".input-panel").forEach((panel) => {
      const isActive = panel.id === `input-${type}`;
      if (isActive) {
        panel.classList.remove("hidden");
      } else {
        panel.classList.add("hidden");
      }
    });

    // Generate initial art for the type
    this.generateArt();
  }

  generateArt() {
    const type = this.container.querySelector(".type-btn.active").dataset.type;

    switch (type) {
      case "text":
        const text = this.container.querySelector("#text-input").value;
        const font = this.container.querySelector("#font-select").value;
        this.generateFromText(text, font);
        break;

      case "image":
        this.generateFromImage();
        break;

      case "shapes":
        const shape = this.container.querySelector("#shape-select").value;
        this.generateShape(shape);
        break;

      case "banner":
        const bannerText = this.container.querySelector("#banner-text").value;
        const bannerStyle = this.container.querySelector("#banner-style").value;
        const bannerWidth = parseInt(
          this.container.querySelector("#banner-width").value,
        );
        this.generateBanner(bannerText, bannerStyle, bannerWidth);
        break;

      case "table":
        const tableData = this.container.querySelector("#table-data").value;
        const tableStyle = this.container.querySelector("#table-style").value;
        this.generateTable(tableData, tableStyle);
        break;
    }
  }

  generateFromText(text, font = "standard") {
    if (!text) {
      this.asciiOutput.textContent = "";
      this.updateInfo();
      return;
    }

    const fontConfig = FIGLET_FONTS[font] || FIGLET_FONTS.standard;
    const fontName = fontConfig[0];

    try {
      const output = figlet.textSync(text, {
        font: fontName,
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 120,
        whitespaceBreak: false,
      });

      this.asciiOutput.textContent = output;
      this.updateInfo();
    } catch (error) {
      console.error("FIGlet error:", error);

      this.asciiOutput.textContent =
        "Unable to generate ASCII art with this font.";

      this.updateInfo();
    }
  }

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      this.handleImageFile(file);
    }
  }

  handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      this.showImageError("Please upload a valid image file.");
      return;
    }

    // Prevent extremely large files from consuming excessive memory.
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      this.showImageError("Image is too large. Maximum file size is 10 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        this.sourceImage = img;
        this.canvas.hidden = false;
        this.clearImageError();
        this.processImage(img);
      };

      img.onerror = () => {
        this.showImageError(
          "Unable to read this image. Please try another file.",
        );
        this.canvas.hidden = true;
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      this.showImageError("Unable to read the selected file.");
    };

    reader.readAsDataURL(file);
  }

  processImage(img) {
    if (!img || !img.width || !img.height) {
      this.showImageError("Invalid image dimensions.");
      return;
    }

    const width = Math.max(
      40,
      Math.min(
        200,
        parseInt(this.container.querySelector("#ascii-width").value, 10) || 80,
      ),
    );

    // Characters are usually taller than they are wide,
    // so compensate for terminal character aspect ratio.
    const aspectRatio = img.height / img.width;
    const height = Math.max(1, Math.round(aspectRatio * width * 0.5));

    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.clearRect(0, 0, width, height);

    // Use high-quality image scaling.
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";

    this.ctx.drawImage(img, 0, 0, width, height);

    this.generateFromImage();
  }

  generateFromImage() {
    if (this.canvas.hidden || !this.canvas.width || !this.canvas.height) {
      return;
    }

    const width = this.canvas.width;
    const height = this.canvas.height;

    const imageData = this.ctx.getImageData(0, 0, width, height);

    const pixels = imageData.data;

    const charSetType = this.container.querySelector("#char-set").value;

    const invert = this.container.querySelector("#invert-chars").checked;

    let chars = this.getCharSet(charSetType);

    // Fix inversion without mutating the original string.
    if (invert) {
      chars = chars.split("").reverse().join("");
    }

    let ascii = "";

    for (let y = 0; y < height; y++) {
      let line = "";

      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const alpha = pixels[i + 3];

        // Transparent pixels are treated as white/background.
        if (alpha === 0) {
          line += chars[0];
          continue;
        }

        // Perceptual luminance.
        // Human vision is more sensitive to green than blue.
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        const normalized = luminance / 255;

        const charIndex = Math.min(
          chars.length - 1,
          Math.floor(normalized * (chars.length - 1)),
        );

        line += chars[charIndex];
      }

      ascii += line;

      if (y < height - 1) {
        ascii += "\n";
      }
    }

    this.asciiOutput.textContent = ascii;
    this.updateInfo();
  }

  showImageError(message) {
    let error = this.container.querySelector("#image-error");

    if (!error) {
      error = document.createElement("p");
      error.id = "image-error";
      error.className = "mt-3 text-sm text-red-600 dark:text-red-400";

      const uploadArea = this.container.querySelector("#upload-area");

      uploadArea.insertAdjacentElement("afterend", error);
    }

    error.textContent = message;
    error.hidden = false;
  }

  clearImageError() {
    const error = this.container.querySelector("#image-error");

    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  }

  getCharSet(type) {
    switch (type) {
      case "detailed":
        return " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
      case "blocks":
        return " ░▒▓█";
      case "binary":
        return " 01";
      default:
        return " .:-=+*#%@";
    }
  }

  generateShape(shape) {
    const width = parseInt(this.container.querySelector("#shape-width").value);
    const height = parseInt(
      this.container.querySelector("#shape-height").value,
    );
    const char = this.container.querySelector("#shape-char").value || "*";

    let ascii = "";

    switch (shape) {
      case "rectangle":
        for (let y = 0; y < height; y++) {
          ascii += char.repeat(width) + "\n";
        }
        break;

      case "triangle":
        for (let y = 0; y < height; y++) {
          const spaces = " ".repeat(height - y - 1);
          const stars = char.repeat(2 * y + 1);
          ascii += spaces + stars + "\n";
        }
        break;

      case "circle":
        const radius = Math.min(width, height) / 2;
        for (let y = 0; y < height; y++) {
          let line = "";
          for (let x = 0; x < width; x++) {
            const dx = x - width / 2;
            const dy = y - height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            line += distance <= radius ? char : " ";
          }
          ascii += line + "\n";
        }
        break;

      case "diamond":
        const mid = Math.floor(height / 2);
        for (let y = 0; y < height; y++) {
          const dist = Math.abs(y - mid);
          const spaces = " ".repeat(dist);
          const chars = char.repeat(height - dist * 2);
          ascii += spaces + chars + "\n";
        }
        break;

      case "star": {
        // Create a real 5-point star polygon.
        const cx = (width - 1) / 2;
        const cy = (height - 1) / 2;

        const outerRadius = 0.48;
        const innerRadius = 0.2;

        const points = [];

        // 10 points: 5 outer + 5 inner
        for (let i = 0; i < 10; i++) {
          const angle = -Math.PI / 2 + (i * Math.PI) / 5;

          const radius = i % 2 === 0 ? outerRadius : innerRadius;

          points.push({
            x: cx + Math.cos(angle) * width * radius,
            y: cy + Math.sin(angle) * height * radius,
          });
        }

        // Point-in-polygon test
        const isInsideStar = (x, y) => {
          let inside = false;

          for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x;
            const yi = points[i].y;
            const xj = points[j].x;
            const yj = points[j].y;

            const intersects =
              yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

            if (intersects) {
              inside = !inside;
            }
          }

          return inside;
        };

        for (let y = 0; y < height; y++) {
          let line = "";

          for (let x = 0; x < width; x++) {
            line += isInsideStar(x, y) ? char : " ";
          }

          ascii += line + "\n";
        }

        break;
      }
      case "heart":
        ascii = ` ${char}${char}${char}   ${char}${char}${char}\n${char}${char}${char}${char}${char} ${char}${char}${char}${char}${char}\n${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}\n ${char}${char}${char}${char}${char}${char}${char}${char}${char}\n  ${char}${char}${char}${char}${char}${char}${char}\n   ${char}${char}${char}${char}${char}\n    ${char}${char}${char}\n     ${char}`;
        break;

      case "arrow":
        ascii = `    ${char}\n   ${char}${char}${char}\n  ${char}${char}${char}${char}${char}\n ${char}${char}${char}${char}${char}${char}${char}\n    ${char}${char}${char}\n    ${char}${char}${char}\n    ${char}${char}${char}`;
        break;

      case "tree": {
        const trunkWidth = Math.max(1, Math.floor(width * 0.12));
        const canopyHeight = Math.max(2, height - 3);

        for (let y = 0; y < canopyHeight; y++) {
          const progress = y / Math.max(1, canopyHeight - 1);

          const canopyWidth = Math.max(
            1,
            Math.round(1 + progress * (width - 1)),
          );

          const padding = Math.max(0, Math.floor((width - canopyWidth) / 2));

          ascii += " ".repeat(padding) + char.repeat(canopyWidth) + "\n";
        }

        const trunkPadding = Math.max(0, Math.floor((width - trunkWidth) / 2));

        for (let i = 0; i < height - canopyHeight; i++) {
          ascii += " ".repeat(trunkPadding) + char.repeat(trunkWidth);

          if (i < height - canopyHeight - 1) {
            ascii += "\n";
          }
        }

        break;
      }
    }

    this.asciiOutput.textContent = ascii;
    this.updateInfo();
  }

  generateBanner(text, style, width) {
    if (!text) {
      this.asciiOutput.textContent = "";
      return;
    }

    const padding = Math.max(0, Math.floor((width - text.length - 4) / 2));
    const paddedText = " ".repeat(padding) + text + " ".repeat(padding);

    let banner = "";

    switch (style) {
      case "simple":
        banner = `${"─".repeat(width)}\n`;
        banner += `│${paddedText.padEnd(width - 2)}│\n`;
        banner += `${"─".repeat(width)}`;
        break;

      case "double":
        banner = `╔${"═".repeat(width - 2)}╗\n`;
        banner += `║${paddedText.padEnd(width - 2)}║\n`;
        banner += `╚${"═".repeat(width - 2)}╝`;
        break;

      case "ascii":
        banner = `+${"-".repeat(width - 2)}+\n`;
        banner += `|${paddedText.padEnd(width - 2)}|\n`;
        banner += `+${"-".repeat(width - 2)}+`;
        break;

      case "stars":
        banner = `${"*".repeat(width)}\n`;
        banner += `*${paddedText.padEnd(width - 2)}*\n`;
        banner += `${"*".repeat(width)}`;
        break;

      case "dashed":
        banner = `┌${"┈".repeat(width - 2)}┐\n`;
        banner += `┊${paddedText.padEnd(width - 2)}┊\n`;
        banner += `└${"┈".repeat(width - 2)}┘`;
        break;
    }

    this.asciiOutput.textContent = banner;
    this.updateInfo();
  }

  generateTable(csvData, style) {
    if (!csvData) {
      this.asciiOutput.textContent = "";
      return;
    }

    const rows = csvData
      .trim()
      .split("\n")
      .map((row) => row.split(",").map((cell) => cell.trim()));
    if (rows.length === 0) return;

    // Calculate column widths
    const colWidths = [];
    for (let col = 0; col < rows[0].length; col++) {
      let maxWidth = 0;
      for (let row = 0; row < rows.length; row++) {
        if (rows[row][col]) {
          maxWidth = Math.max(maxWidth, rows[row][col].length);
        }
      }
      colWidths.push(maxWidth + 2);
    }

    let table = "";

    switch (style) {
      case "simple":
        rows.forEach((row, i) => {
          row.forEach((cell, j) => {
            table += cell.padEnd(colWidths[j]);
          });
          table += "\n";
          if (i === 0) {
            table += "-".repeat(colWidths.reduce((a, b) => a + b, 0)) + "\n";
          }
        });
        break;

      case "grid":
        // Top border
        table += "┌" + colWidths.map((w) => "─".repeat(w)).join("┬") + "┐\n";

        rows.forEach((row, i) => {
          table += "│";
          row.forEach((cell, j) => {
            table += " " + cell.padEnd(colWidths[j] - 1) + "│";
          });
          table += "\n";

          if (i === 0) {
            table +=
              "├" + colWidths.map((w) => "─".repeat(w)).join("┼") + "┤\n";
          }
        });

        // Bottom border
        table += "└" + colWidths.map((w) => "─".repeat(w)).join("┴") + "┘";
        break;

      case "pipe":
        rows.forEach((row, i) => {
          table +=
            "| " +
            row.map((cell, j) => cell.padEnd(colWidths[j] - 2)).join(" | ") +
            " |\n";

          if (i === 0) {
            table +=
              "|" + colWidths.map((w) => "-".repeat(w)).join("|") + "|\n";
          }
        });
        break;

      case "markdown":
        // Standard Markdown table syntax
        table += "| " + rows[0].map((cell) => cell).join(" | ") + " |\n";

        table += "| " + rows[0].map(() => "---").join(" | ") + " |\n";

        for (let i = 1; i < rows.length; i++) {
          table += "| " + rows[i].map((cell) => cell).join(" | ") + " |\n";
        }
        break;
    }

    this.asciiOutput.textContent = table;
    this.updateInfo();
  }

  loadExample(example) {
    const examples = {
      smiley: "   ◕ ◡ ◕\n  \\     /\n   \\___/",
      cat: "    /\\_/\\\n   ( o.o )\n    > ^ <",
      coffee: "    ) (\n   (   )\n  |~~~~~|\n  \\___/",
      computer:
        " ___________\n|  _______  |\n| |       | |\n| |_______| |\n|___________|",
      music: "    ♪ ♫\n   ♫   ♪\n  ♪  ♫  ♪",
      rocket:
        "     ^\n    /|\\\n   / | \\\n  |  |  |\n  | === |\n  |  |  |\n /|  |  |\\\n/_|__|__|_\\",
    };

    this.asciiOutput.textContent = examples[example] || "";
    this.updateInfo();
  }

  updateInfo() {
    const text = this.asciiOutput.textContent;
    const lines = text.split("\n").length;
    const chars = text.length;

    this.container.querySelector("#output-lines").textContent =
      `${lines} lines`;
    this.container.querySelector("#output-chars").textContent =
      `${chars} characters`;
  }

  copyArt() {
    const text = this.asciiOutput.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = "✓";
      btn.style.color = "var(--color-success)";

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.color = "";
      }, 2000);
    });
  }

  downloadArt() {
    const text = this.asciiOutput.textContent;
    if (!text) return;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  clear() {
    this.asciiOutput.textContent = "";
    this.canvas.hidden = true;
    this.updateInfo();
  }
}
