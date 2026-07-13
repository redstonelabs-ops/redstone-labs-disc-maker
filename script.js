let viewMode = "disc";
let currentTab = "bordes";
let currentPack = "all";
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
const PIXEL_SIZE = 30;
const DISC_WIDTH = 15;
const DISC_HEIGHT = 10;
const MC_WIDTH = 16;
const MC_HEIGHT = 16;
const MC_PIXEL_SIZE = 20;
const MC_OFFSET_X =
    (canvas.width - (MC_WIDTH * MC_PIXEL_SIZE)) / 2;
const MC_OFFSET_Y =
    (canvas.height - (MC_HEIGHT * MC_PIXEL_SIZE)) / 2;
const SHOW_DISC_OUTLINE = true;
const DISC_MASK = [
    "000001111100000",
    "001111111111100",
    "011111111111110",
    "111111111111111",
    "111111111111111",
    "111111111111111",
    "111111111111111",
    "011111111111110",
    "001111111111100",
    "000001111100000"
];

function isDiscPixel(x, y) {

    return DISC_MASK[y][x] === "1";

}
const OFFSET_X =
    (canvas.width - (DISC_WIDTH * PIXEL_SIZE)) / 2;
const OFFSET_Y =
    (canvas.height - (DISC_HEIGHT * PIXEL_SIZE)) / 2;
let bordes = [];
let interiores = [];
let centros = [];
let detalles = [];
let packs = [];
let printTemplate = [];

let selectedBorder = null;
let selectedInterior = null;
let selectedCenter = null;
let selectedDetail = null;

// Limpiar canvas
ctx.clearRect(0, 0, canvas.width, canvas.height);

async function loadData() {

    const templateResponse =
    await fetch(
        "data/printTemplate.json"
    );

    printTemplate =
        await templateResponse.json();

    try {

        bordes = [];
        interiores = [];
        centros = [];
        detalles = [];

        const packsResponse =
            await fetch(
                "data/packs.json"
            );

        packs =
            await packsResponse.json();

        for(const pack of packs) {

            const response =
                await fetch(
                    `data/${pack}.json`
                );

            const piezas =
                await response.json();

            piezas.forEach(pieza => {

                switch(pieza.type) {

                    case 0:
                        bordes.push(pieza);
                        break;

                    case 1:
                        interiores.push(pieza);
                        break;

                    case 2:
                        centros.push(pieza);
                        break;

                    case 3:
                        detalles.push(pieza);
                        break;

                }

            });

        }
        renderCurrentTab();
        renderPackFilters();

    }

    catch(error) {

        console.error(
            "Error cargando packs:",
            error
        );

    }

}

function updateSelectionSummary() {

    document.getElementById(
        "selectedBorderName"
    ).textContent =
        selectedBorder
            ? selectedBorder.nombre
            : "Ninguno";

    document.getElementById(
        "selectedInteriorName"
    ).textContent =
        selectedInterior
            ? selectedInterior.nombre
            : "Ninguno";

    document.getElementById(
        "selectedCenterName"
    ).textContent =
        selectedCenter
            ? selectedCenter.nombre
            : "Ninguno";

    document.getElementById(
        "selectedDetailName"
    ).textContent =
        selectedDetail
            ? selectedDetail.nombre
            : "Ninguno";

}

function renderOptions(options,type) {

    const container =
        document.getElementById(
            "optionsContainer"
        );

    container.innerHTML = "";

    options.forEach(option => {

        const card =
            document.createElement("div");

        let selectedItem = null;

        switch(type) {

            case "border":
                selectedItem = selectedBorder;
                break;
            case "interior":
                selectedItem = selectedInterior;
                break;
            case "center":
                selectedItem = selectedCenter;
                break;
            case "detail":
                selectedItem = selectedDetail;
                break;
        }

        card.className =
            "option-card";
            
        if(
            selectedItem &&
            selectedItem.id === option.id
        ) {

            card.classList.add(
                "selected"
            );

}
        card.innerHTML = `
            <canvas
                class="option-preview"
                width="90"
                height="60">
            </canvas>

            <div class="option-name">
                ${option.nombre}
            </div>
        `;

        card.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".option-card")
                    .forEach(card =>
                        card.classList.remove("selected")
                    );

                card.classList.add("selected");

                switch(type) {
                    case "border":
                        selectedBorder = option;
                        break;
                    case "interior":
                        selectedInterior = option;
                        break;
                    case "center":
                        selectedCenter = option;
                        break;
                    case "detail":
                        selectedDetail = option;
                        break;
}

                renderCanvas();
                updateSelectionSummary();

            }
        );

        container.appendChild(card);

        const previewCanvas =
            card.querySelector(
                "canvas"
            );
        drawBorderPreview(
            previewCanvas,
            option
        );

    });

}

function renderCurrentTab() {

    switch(currentTab) {

        case "bordes":
            renderOptions(
                getFilteredOptions(bordes),
                "border"
            );
            break;

        case "interiores":
            renderOptions(
                getFilteredOptions(interiores),
                "interior"
            );
            break;

        case "centros":
            renderOptions(
                getFilteredOptions(centros),
                "center"
            );
            break;

        case "detalles":
            renderOptions(
                getFilteredOptions(detalles),
                "detail"
            );
            break;

    }

}

function getFilteredOptions(lista) {

    if(currentPack === "all")
        return lista;

    return lista.filter(
        item =>
            item.pack === currentPack
    );

}

function drawBorderPreview(canvas,border) {
    const ctx =
        canvas.getContext("2d");
    const pixelSize = 6;
    const PREVIEW_WIDTH = 15;
    const PREVIEW_HEIGHT = 10;
    const OFFSET_X =
    (canvas.width - (PREVIEW_WIDTH * pixelSize)) / 2;
    const OFFSET_Y =
    (canvas.height - (PREVIEW_HEIGHT * pixelSize)) / 2;
    border.pixeles.forEach(
        pixel => {

            const [
                x,
                y,
                color
            ] = pixel;

            ctx.fillStyle =
                color;

            ctx.fillRect(
                OFFSET_X + (x * pixelSize),
                OFFSET_Y + (y * pixelSize),
                pixelSize,
                pixelSize
            );

        }
    );

}


//Detectar cambios de modo
const modeButtons =
    document.querySelectorAll(".view-mode");

modeButtons.forEach(button => {

    button.addEventListener("click", () => {

        modeButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        viewMode = button.dataset.view;

        renderCanvas();
    });

});

const tabButtons =
    document.querySelectorAll(".tab-button");

tabButtons.forEach(button => {

    button.addEventListener("click", () => {

        tabButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentTab =
            button.dataset.tab;

        renderCurrentTab();

    });

});

//Preparar el renderizado

function renderCanvas() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    switch(viewMode) {
        case "disc":
            renderDiscView();
            break;
        case "minecraft":
            renderMinecraftView();
            break;
    }
}

function drawPixels(pixeles) {

    pixeles.forEach(pixel => {

        const [x, y, color] = pixel;

        ctx.fillStyle = color;

        ctx.fillRect(
            OFFSET_X + (x * PIXEL_SIZE),
            OFFSET_Y + (y * PIXEL_SIZE),
            PIXEL_SIZE,
            PIXEL_SIZE
        );

    });

}

function drawMinecraftPixel(x, y, color, pixelSize) {

    ctx.fillStyle = color;

    ctx.fillRect(
        MC_OFFSET_X + (x * pixelSize),
        MC_OFFSET_Y + (y * pixelSize),
        pixelSize,
        pixelSize
    );

}

function drawMinecraftPixels(pixeles) {

    pixeles.forEach(pixel => {

        const [x, y, color] = pixel;

        drawMinecraftPixel(
            x,
            y + 3,
            color,
            MC_PIXEL_SIZE
        );

    });

}

function drawDiscMask() {

    ctx.fillStyle = "#2b2b2b";

    for(let y = 0; y < DISC_HEIGHT; y++) {

        for(let x = 0; x < DISC_WIDTH; x++) {

            if(!isDiscPixel(x, y))
                continue;

            ctx.fillRect(
                OFFSET_X + (x * PIXEL_SIZE),
                OFFSET_Y + (y * PIXEL_SIZE),
                PIXEL_SIZE,
                PIXEL_SIZE
            );

        }

    }

}

function drawDiscBackground() {

    const DIVISIONS = 2;

    const CELL_SIZE =
        PIXEL_SIZE / DIVISIONS;

    for(let y = 0; y < DISC_HEIGHT; y++) {

        for(let x = 0; x < DISC_WIDTH; x++) {

            if(!isDiscPixel(x, y))
                continue;

            for(let subY = 0; subY < DIVISIONS; subY++) {

                for(let subX = 0; subX < DIVISIONS; subX++) {

                    const even =
                        (subX + subY) % 2 === 0;

                    ctx.fillStyle =
                        even
                            ? "#e5e5e5"
                            : "#f5f5f5";

                    ctx.fillRect(
                        OFFSET_X + (x * PIXEL_SIZE) + (subX * CELL_SIZE),
                        OFFSET_Y + (y * PIXEL_SIZE) + (subY * CELL_SIZE),
                        CELL_SIZE,
                        CELL_SIZE
                    );

                }

            }

        }

    }

}

function renderDiscView() {

    drawDiscBackground();

    if(selectedBorder)
        drawPixels(selectedBorder.pixeles);

    if(selectedInterior)
        drawPixels(selectedInterior.pixeles);

    if(selectedCenter)
        drawPixels(selectedCenter.pixeles);

    if(selectedDetail)
        drawPixels(selectedDetail.pixeles);

}

function drawMinecraftBackground() {

    const DIVISIONS = 2;

    const CELL_SIZE =
        MC_PIXEL_SIZE / DIVISIONS;

    for(let y = 0; y < MC_HEIGHT; y++) {

        for(let x = 0; x < MC_WIDTH; x++) {

            for(let subY = 0; subY < DIVISIONS; subY++) {

                for(let subX = 0; subX < DIVISIONS; subX++) {

                    const even =
                        (subX + subY) % 2 === 0;

                    ctx.fillStyle =
                        even
                            ? "#e5e5e5"
                            : "#f5f5f5";

                    ctx.fillRect(
                        MC_OFFSET_X + (x * MC_PIXEL_SIZE) + (subX * CELL_SIZE),
                        MC_OFFSET_Y + (y * MC_PIXEL_SIZE) + (subY * CELL_SIZE),
                        CELL_SIZE,
                        CELL_SIZE
                    );

                }

            }

        }

    }

}

function renderMinecraftView() {

    drawMinecraftBackground();

    if(selectedBorder)
        drawMinecraftPixels(selectedBorder.pixeles);

    if(selectedInterior)
        drawMinecraftPixels(selectedInterior.pixeles);

    if(selectedCenter)
        drawMinecraftPixels(selectedCenter.pixeles);

    if(selectedDetail)
        drawMinecraftPixels(selectedDetail.pixeles);

}

function renderPackFilters() {

    const container =
        document.getElementById(
            "packFilters"
        );

    container.innerHTML = "";

    const allButton =
        document.createElement("button");

    allButton.textContent =
        "Todos";

    allButton.className =
        currentPack === "all"
            ? "pack-button active"
            : "pack-button";

    allButton.addEventListener(
        "click",
        () => {

            currentPack = "all";

            renderPackFilters();
            renderCurrentTab();

        }
    );

    container.appendChild(
        allButton
    );

    packs.forEach(pack => {

        const button =
            document.createElement("button");

        button.textContent =
            pack.charAt(0).toUpperCase() +
            pack.slice(1);

        button.className =
            currentPack === pack
                ? "pack-button active"
                : "pack-button";

        button.addEventListener(
            "click",
            () => {

                currentPack = pack;

                renderPackFilters();
                renderCurrentTab();

            }
        );

        container.appendChild(
            button
        );

    });

}

async function exportDisc() {

    const studentName =
        document
            .getElementById(
                "studentName"
            )
            .value
            .trim();
    if(!studentName) {
        showModal("⚠ Atención","Debes ingresar el nombre del alumno antes de exportar.");
        document
            .getElementById("studentName")
            .focus();
        return;
    }else{
        if(!selectedBorder) {
        showModal("⚠ Atención","Debes seleccionar un borde antes de exportar.");
        document
            .querySelector('[data-tab="bordes"]')
            .click();
        return;
        }else{
            if(!selectedInterior) {
            showModal("⚠ Atención","Debes seleccionar un interior antes de exportar.");
            document
                .querySelector('[data-tab="interiores"]')
                .click();
            return;
            }else{
                if(!selectedCenter) {
                showModal("⚠ Atención","Debes seleccionar un centro antes de exportar.");
                document
                    .querySelector('[data-tab="centros"]')
                    .click();
                return;
                }
            }
        }
    }

    const finalPixels =
        buildFinalPixels();

    const minecraftCanvas =
        generateMinecraftCanvas(
            finalPixels
        );

    const printCanvas =
        generatePrintCanvas(
            finalPixels
        );

    const zip =
        new JSZip();

    zip.file(
        "nombre.txt",
        studentName
    );

    zip.file(
        "minecraft.png",
        await canvasToBlob(
            minecraftCanvas
        )
    );

    zip.file(
        "impresion.png",
        await canvasToBlob(
            printCanvas
        )
    );

    const blob =
        await zip.generateAsync({
            type: "blob"
        });

    const link =
        document.createElement(
            "a"
        );

    link.href =
        URL.createObjectURL(
            blob
        );

    link.download =
        studentName
            .replaceAll(
                " ",
                "_"
            ) + ".zip";

    document.body.appendChild(
        link
    );

    link.click();
    
    showModal(
        "¡Todo listo!",
        `El disco de ${studentName} se exportó correctamente.`
    );
    
    document.body.removeChild(
        link
    );

    URL.revokeObjectURL(
        link.href
    );

}

function generatePrintCanvas(finalPixels) {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 19;
    canvas.height = 28;

    const ctx =
        canvas.getContext("2d");

    for(
        let y = 0;
        y < printTemplate.length;
        y++
    ) {

        for(
            let x = 0;
            x < printTemplate[y].length;
            x++
        ) {

            const value =
                printTemplate[y][x];

            if(
                value === null
            ) {
                continue;
            }

            const color =
                finalPixels[value];

            if(
                !color
            ) {
                continue;
            }

            ctx.fillStyle =
                color;

            ctx.fillRect(
                x,
                y,
                1,
                1
            );

        }

    }

    return canvas;

}

function canvasToBlob(
    canvas
) {

    return new Promise(
        resolve => {

            canvas.toBlob(
                blob =>
                    resolve(blob),
                "image/png"
            );

        }
    );

}

function generateMinecraftCanvas(
    finalPixels
) {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 16;
    canvas.height = 16;

    const ctx =
        canvas.getContext("2d");

    Object.entries(
        finalPixels
    ).forEach(([key,color]) => {

        const [
            x,
            y
        ] =
            key
                .split("-")
                .map(Number);

        ctx.fillStyle =
            color;

        ctx.fillRect(
            x,
            y + 3,
            1,
            1
        );

    });

    return canvas;

}

function buildFinalPixels() {

    const pixels = {};

    if(selectedBorder) {

        selectedBorder.pixeles.forEach(
            pixel => {

                const [x,y,color] =
                    pixel;

                pixels[
                    `${x}-${y}`
                ] = color;

            }
        );

    }

    if(selectedInterior) {

        selectedInterior.pixeles.forEach(
            pixel => {

                const [x,y,color] =
                    pixel;

                pixels[
                    `${x}-${y}`
                ] = color;

            }
        );

    }

    if(selectedCenter) {

        selectedCenter.pixeles.forEach(
            pixel => {

                const [x,y,color] =
                    pixel;

                pixels[
                    `${x}-${y}`
                ] = color;

            }
        );

    }

    if(selectedDetail) {

        selectedDetail.pixeles.forEach(
            pixel => {

                const [x,y,color] =
                    pixel;

                pixels[
                    `${x}-${y}`
                ] = color;

            }
        );

    }

    return pixels;

}

function showModal(title, message) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalMessage").textContent = message;
    document
        .getElementById("modalOverlay")
        .classList.add("show");
}

function closeModal() {

    document.getElementById(
        "modalOverlay"
    ).classList.remove(
        "show"
    );

}

document
    .getElementById(
        "modalButton"
    )
    .addEventListener(
        "click",
        closeModal
    );

renderCanvas();
loadData();

document
    .getElementById("exportButton")
    .addEventListener(
        "click",
        exportDisc
    );

