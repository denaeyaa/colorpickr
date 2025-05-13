        const unggahGambarInput = document.getElementById('unggahGambar');
        const gambarCanvas = document.getElementById('gambarCanvas');
        const gambarCanvasContainer = document.getElementById('gambarCanvasContainer');
        const ctx = gambarCanvas.getContext('2d');
        const infoWarnaDiv = document.getElementById('infoWarna');
        const previewWarnaDiv = document.getElementById('previewWarna');
        const hexValueSpan = infoWarnaDiv.querySelector('#hexValue');
        const rgbValueSpan = infoWarnaDiv.querySelector('#rgbValue');
        const hslValueSpan = infoWarnaDiv.querySelector('#hslValue');
        const copyHexButton = infoWarnaDiv.querySelector('#copyHex');
        const copyRgbButton = infoWarnaDiv.querySelector('#copyRgb');
        const copyHslButton = infoWarnaDiv.querySelector('#copyHsl');
        const manualColorInput = document.getElementById('manualColorInput');
        const manualColorPreviewDiv = document.getElementById('manualColorPreview');
        const historyPaletteDiv = infoWarnaDiv.querySelector('#historyPalette');
        const initialTextSpan = infoWarnaDiv.querySelector('span:first-child');
        const colorHistory = [];
        const maxHistorySize = 10;
        let gambar = new Image();
        let cursorDot;
        let currentColorHex = '';
        let currentColorRgb = '';
        let currentColorHsl = '';

        const downloadAcoButton = document.getElementById('downloadAco');
        const downloadJsonButton = document.getElementById('downloadJson');
        const downloadTxtButton = document.getElementById('downloadTxt');
        const downloadCssButton = document.getElementById('downloadCss');

        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; 
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
        }

        function addColorToHistory(colorHex) {
            if (colorHex && !colorHistory.includes(colorHex)) {
                colorHistory.unshift(colorHex); 
                if (colorHistory.length > maxHistorySize) {
                    colorHistory.pop(); 
                }
                updateHistoryPalette();
            }
        }

        function updateHistoryPalette() {
            historyPaletteDiv.innerHTML = ''; 
            colorHistory.forEach(color => {
                const historyColorDiv = document.createElement('div');
                historyColorDiv.classList.add('history-color');
                historyColorDiv.style.backgroundColor = color;
                historyColorDiv.addEventListener('click', function() {
                    manualColorInput.value = color;
                    manualColorPreviewDiv.style.backgroundColor = color;
                });
                historyPaletteDiv.appendChild(historyColorDiv);
            });
        }

        unggahGambarInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files.length > 0) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    gambar.onload = function() {
                        gambarCanvas.width = gambarCanvasContainer.offsetWidth;
                        gambarCanvas.height = gambar.height * (gambarCanvas.width / gambar.width);
                        ctx.drawImage(gambar, 0, 0, gambarCanvas.width, gambarCanvas.height);
                        initialTextSpan.textContent = 'Arahkan kursor ke gambar:';
                        previewWarnaDiv.style.backgroundColor = 'transparent';
                        previewWarnaDiv.style.display = 'block';
                        hexValueSpan.textContent = '';
                        rgbValueSpan.textContent = '';
                        hslValueSpan.textContent = '';
                        currentColorHex = '';
                        currentColorRgb = '';
                        currentColorHsl = '';
                        colorHistory.length = 0; 
                        updateHistoryPalette();
                    }
                    gambar.src = e.target.result;
                }
                reader.readAsDataURL(e.target.files[0]);
            } else {
                ctx.clearRect(0, 0, gambarCanvas.width, gambarCanvas.height);
                previewWarnaDiv.style.backgroundColor = 'transparent';
                previewWarnaDiv.style.display = 'none';
                initialTextSpan.textContent = 'Pilih gambar untuk mulai.';
                hexValueSpan.textContent = '';
                rgbValueSpan.textContent = '';
                hslValueSpan.textContent = '';
                currentColorHex = '';
                currentColorRgb = '';
                currentColorHsl = '';
                colorHistory.length = 0;
                updateHistoryPalette();
            }
        });

        gambarCanvasContainer.addEventListener('mousemove', function(e) {
            const rect = gambarCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (mouseX >= 0 && mouseX < gambarCanvas.width && mouseY >= 0 && mouseY < gambarCanvas.height) {
                const pixelData = ctx.getImageData(mouseX, mouseY, 1, 1).data;
                const red = pixelData ? pixelData[0] : 0;
                const green = pixelData ? pixelData[1] : 0;
                const blue = pixelData ? pixelData[2] : 0;

                const hex = "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
                const rgb = `rgb(${red}, ${green}, ${blue})`;
                const hsl = rgbToHsl(red, green, blue);

                currentColorHex = hex;
                currentColorRgb = rgb;
                currentColorHsl = hsl;
                hexValueSpan.textContent = hex;
                rgbValueSpan.textContent = rgb;
                hslValueSpan.textContent = hsl;
                previewWarnaDiv.style.backgroundColor = hex;
                addColorToHistory(hex);

                if (cursorDot) {
                    cursorDot.style.left = mouseX + 'px';
                    cursorDot.style.top = mouseY + 'px';
                }
            }
        });

        gambarCanvasContainer.addEventListener('mouseenter', function() {
            gambarCanvasContainer.classList.add('custom-cursor');
            cursorDot = document.createElement('div');
            cursorDot.classList.add('cursor-dot');
            gambarCanvasContainer.appendChild(cursorDot);
        });

        gambarCanvasContainer.addEventListener('mouseleave', function() {
            gambarCanvasContainer.classList.remove('custom-cursor');
            if (cursorDot) {
                cursorDot.remove();
                cursorDot = null;
            }
            if (currentColorHex) {
                previewWarnaDiv.style.backgroundColor = currentColorHex;
                hexValueSpan.textContent = currentColorHex;
                rgbValueSpan.textContent = currentColorRgb;
                hslValueSpan.textContent = currentColorHsl;
            } else {
                initialTextSpan.textContent = 'Pilih gambar untuk mulai.';
                previewWarnaDiv.style.backgroundColor = 'transparent';
                hexValueSpan.textContent = '';
                rgbValueSpan.textContent = '';
                hslValueSpan.textContent = '';
            }
        });

        // fitur buat salin ke clipboard
        copyHexButton.addEventListener('click', function() {
            if (currentColorHex) {
                navigator.clipboard.writeText(currentColorHex).then(() => {
                    alert('Kode HEX berhasil disalin: ' + currentColorHex);
                }).catch(err => {
                    console.error('Gagal menyalin HEX: ', err);
                });
            } else {
                alert('Pilih warna terlebih dahulu.');
            }
        });

        copyRgbButton.addEventListener('click', function() {
            if (currentColorRgb) {
                navigator.clipboard.writeText(currentColorRgb).then(() => {
                    alert('Kode RGB berhasil disalin: ' + currentColorRgb);
                }).catch(err => {
                    console.error('Gagal menyalin RGB: ', err);
                });
            } else {
                alert('Pilih warna terlebih dahulu.');
            }
        });

        copyHslButton.addEventListener('click', function() {
            if (currentColorHsl) {
                navigator.clipboard.writeText(currentColorHsl).then(() => {
                    alert('Kode HSL berhasil disalin: ' + currentColorHsl);
                }).catch(err => {
                    console.error('Gagal menyalin HSL: ', err);
                });
            } else {
                alert('Pilih warna terlebih dahulu.');
            }
        });

        // ini input manual kode warna
        manualColorInput.addEventListener('input', function() {
            const inputColor = this.value.trim();
            manualColorPreviewDiv.style.backgroundColor = inputColor;
            // ini buat validasi format warna
            if ((inputColor.startsWith('#') && inputColor.length === 7) ||
                (inputColor.startsWith('rgb(') && inputColor.endsWith(')')) ||
                (inputColor.startsWith('hsl(') && inputColor.endsWith(')'))) {
                addColorToHistory(inputColor);
            }
        });

        function downloadFile(filename, content) {
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

        function generateTxtContent(colors) {
            return colors.join('\n');
        }

        downloadTxtButton.addEventListener('click', function() {
            if (colorHistory.length > 0) {
                const filename = 'palet_warna.txt';
                const content = generateTxtContent(colorHistory);
                downloadFile(filename, content);
            } else {
                alert('Belum ada warna dalam riwayat untuk diunduh.');
            }
        });

        function generateJsonContent(colors) {
            return JSON.stringify({ palette: colors }, null, 2); 
        }

        downloadJsonButton.addEventListener('click', function() {
            if (colorHistory.length > 0) {
                const filename = 'palet_warna.json';
                const content = generateJsonContent(colorHistory);
                downloadFile(filename, content);
            } else {
                alert('Belum ada warna dalam riwayat untuk diunduh.');
            }
        });

        function generateCssContent(colors) {
            let css = ':root {\n';
            colors.forEach((color, index) => {
                css += `    --color-${index + 1}: ${color};\n`;
            });
            css += '}\n\n/* Anda bisa menggunakan class berikut pada elemen HTML Anda */\n';
            colors.forEach((color, index) => {
                css += `.bg-color-${index + 1} { background-color: var(--color-${index + 1}); }\n`;
                css += `.text-color-${index + 1} { color: var(--color-${index + 1}); }\n`;
            });
            return css;
        }

        downloadCssButton.addEventListener('click', function() {
            if (colorHistory.length > 0) {
                const filename = 'palet_warna.css';
                const content = generateCssContent(colorHistory);
                downloadFile(filename, content);
            } else {
                alert('Belum ada warna dalam riwayat untuk diunduh.');
            }
        });

        downloadAcoButton.addEventListener('click', function() {
            alert('Maaf yaa, format .ACO tidak didukung untuk pengunduhan langsung. Kamu bisa mengunduh dalam format .JSON dan mengimpornya ke beberapa aplikasi Adobe, atau menggunakan alat konversi online.');
        });