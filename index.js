window.addEventListener("load", () => {
    let sfx = new Audio("./assets/audio/startup.mp3");
    updateProgressBar(100);
    const loaderWrapper = document.getElementById("loader-wrapper");
    
    sfx.play();
    setTimeout(() => {
        loaderWrapper.classList.add("loader-hidden");
        loaderWrapper.addEventListener("transitionend", () => loaderWrapper.remove());
    }, 2000);
});

function updateProgressBar(percent) {
    const fill = document.getElementById('fill');
    if (fill) fill.style.width = percent + "%";
}

const resources = document.querySelectorAll('img, audio, script');
let loadedCount = 0;
resources.forEach(res => {
    res.addEventListener('load', () => {
        loadedCount++;
        let progress = (loadedCount / resources.length) * 100;
        updateProgressBar(progress);
    });
});


let highestZIndex = 100;

class WindowApp {
    constructor(title, url) {
        this.title = title;
        this.url = url;
        this.windowElement = null;
        this.taskbarTab = null;
        
        this.isMaximized = false;
        this.isMinimized = false;
        this.prevConfig = { top: '', left: '', width: '', height: '' };
        
        this.createWindow();
        this.createTaskbarTab();
        this.setupInteractions();
        this.focusWindow();
    }

    createWindow() {
        this.windowElement = document.createElement('div');
        this.windowElement.className = 'os-window win95';
        this.windowElement.style.top = '10rem';
        this.windowElement.style.left = '10rem';
        
        this.windowElement.innerHTML = `
            <div class="window-header">
                <div class="window-title">${this.title}</div>
                <div class="window-controls">
                    <button class="minimize-btn" title="Minimiser">_</button>
                    <button class="maximize-btn" title="Plein écran">🗖</button>
                    <button class="close-btn" title="Fermer">×</button>
                </div>
            </div>
            <iframe class="window-content" src="${this.url}" title="${this.title}"></iframe>
        `;

        document.getElementById('desktop').appendChild(this.windowElement);
    }

    createTaskbarTab() {
        // Bouton dans la barre des tâches
        this.taskbarTab = document.createElement('div');
        this.taskbarTab.className = 'taskbar-tab win95';
        this.taskbarTab.textContent = this.title;

        // Clic sur la barre des tâches
        this.taskbarTab.addEventListener('click', () => {
            this.toggleWindowFromTaskbar();
        });

        document.getElementById('taskbar-tabs').appendChild(this.taskbarTab);
    }

    // Mise au premier plan
    focusWindow() {
        highestZIndex++;
        this.windowElement.style.zIndex = highestZIndex;
        
        // visuels onglet
        document.querySelectorAll('.taskbar-tab').forEach(tab => tab.classList.remove('active'));
        if (this.taskbarTab) this.taskbarTab.classList.add('active');
        
        // réaffichage
        if (this.isMinimized) {
            this.windowElement.classList.remove('is-minimized');
            this.isMinimized = false;
        }
    }

    
    toggleWindowFromTaskbar() {
        if (this.isMinimized) {
            this.focusWindow();
        } else {
            // fenêtre ouverte mais une autre est passée par-dessus
            if (parseInt(this.windowElement.style.zIndex) < highestZIndex) {
                this.focusWindow();
            } else {
                // déjà au premier plan => la minimise
                this.minimizeWindow();
            }
        }
    }

    minimizeWindow() {
        this.windowElement.classList.add('is-minimized');
        this.isMinimized = true;
        if (this.taskbarTab) this.taskbarTab.classList.remove('active');
    }

    setupInteractions() {
        const header = this.windowElement.querySelector('.window-header');
        const closeBtn = this.windowElement.querySelector('.close-btn');
        const maximizeBtn = this.windowElement.querySelector('.maximize-btn');
        const minimizeBtn = this.windowElement.querySelector('.minimize-btn');

        // focus au clic n'importe où sur la fenêtre
        this.windowElement.addEventListener('mousedown', () => this.focusWindow());

        // Bouton Fermer
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.windowElement.remove();
            if (this.taskbarTab) this.taskbarTab.remove();
        });

        // Bouton Minimiser
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow();
        });

        // Bouton Plein-écran
        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMaximize();
        });
        header.addEventListener('dblclick', () => this.toggleMaximize());

        // Déplacement fenêtre
        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        header.addEventListener('mousedown', (e) => {
            if (this.isMaximized || e.target.tagName === 'BUTTON') return;
            isDragging = true;
            offsetX = e.clientX - this.windowElement.getBoundingClientRect().left;
            offsetY = e.clientY - this.windowElement.getBoundingClientRect().top;
            this.windowElement.classList.add('is-interacting');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            this.windowElement.style.left = `${e.clientX - offsetX}px`;
            this.windowElement.style.top = `${e.clientY - offsetY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.windowElement.classList.remove('is-interacting');
            }
        });

        // Anti-capture Iframe au redimensionnement
        this.windowElement.addEventListener('mousedown', (e) => {
            if (e.target === this.windowElement && !this.isMaximized) {
                this.windowElement.classList.add('is-interacting');
                const stopResize = () => {
                    this.windowElement.classList.remove('is-interacting');
                    document.removeEventListener('mouseup', stopResize);
                };
                document.addEventListener('mouseup', stopResize);
            }
        });
    }

    toggleMaximize() {
        if (!this.isMaximized) {
            this.prevConfig = {
                top: this.windowElement.style.top,
                left: this.windowElement.style.left,
                width: this.windowElement.style.width,
                height: this.windowElement.style.height
            };
            this.windowElement.classList.add('is-maximized');
            this.isMaximized = true;
        } else {
            this.windowElement.classList.remove('is-maximized');
            this.windowElement.style.top = this.prevConfig.top || '10rem';
            this.windowElement.style.left = this.prevConfig.left || '10rem';
            this.windowElement.style.width = this.prevConfig.width || '600px';
            this.windowElement.style.height = this.prevConfig.height || '400px';
            this.isMaximized = false;
        }
    }
}


const specialNames=[
    "LinkedIn"
];

const folderData = {
    "Projets": [
        { name: "Doomscroller", icon: "./assets/icons/doomscroller.png", url: "https://mathishuynh.github.io/Doomscroller-ClickerGame/" },
        { name: "Akropolis", icon: "./assets/icons/akropolis.png", url: "https://mathishuynh.github.io/Akropolis-Version-Terminal/" }
    ]
};

// Registre global des dossiers
const folderDOMs = {}; 

class DesktopEnvironment {
    constructor(containerId) {
        this.desktop = document.getElementById(containerId);
        this.draggedIcon = null;

        this.cellWidthRem = 12; 
        this.cellHeightRem = 14;

        this.init();
    }

    init() {
        this.generateGrid();
        this.populateInitialIcons();
        this.setupDragAndDrop();

        // Recalculer la grille dès que la fenêtre bouge
        window.addEventListener('resize', () => this.generateGrid(true));
    }

    // Génération de la grille
    generateGrid(isResize = false) {
        const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        
        const cellWidthPx = this.cellWidthRem * remInPx;
        const cellHeightPx = this.cellHeightRem * remInPx;
        
        const safetyPaddingPx = 3 * remInPx;

        const cols = Math.floor((window.innerWidth - safetyPaddingPx) / cellWidthPx)-2;
        const rows = Math.floor((window.innerHeight - safetyPaddingPx) / cellHeightPx)-1;
        
        const finalCols = Math.max(2, cols);
        const finalRows = Math.max(2, rows);
        
        this.desktop.style.gridTemplateColumns = `repeat(${finalCols}, ${this.cellWidthRem}rem)`;
        this.desktop.style.gridTemplateRows = `repeat(${finalRows}, ${this.cellHeightRem}rem)`;

        if (!isResize) {
            this.desktop.innerHTML = ''; // On nettoie le bureau
            const totalCells = finalCols * finalRows;
            for (let i = 0; i < totalCells; i++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                this.desktop.appendChild(cell);
            }
        }
    }

    // Icônes initiales
    populateInitialIcons() {
        this.addFolder(0, '📁', 'Mes Projets', folderData['Projets']);
        this.addIcon(1, '🌐', 'Navigateur', './pages/navigateur.html');
        this.addIcon(2, '📄', 'Notes', './notes.html');
        this.addIcon(3, './assets/icons/pdf.png', 'CV.pdf', './assets/documents/CV_HUYNH_Mathis.pdf');
        this.addIcon(4,'./assets/icons/linkedin.png','LinkedIn','https://www.linkedin.com/in/mathis-huynh/')
        this.addIcon(17, './assets/icons/doomscroller.png', 'Doomscroller.exe', 'https://mathishuynh.github.io/Doomscroller-ClickerGame/');
        this.addIcon(34, './assets/icons/akropolis.png', 'Akropolis.exe', 'https://mathishuynh.github.io/Akropolis-Version-Terminal/'); 
        this.addIcon(16, '🗑️', 'Corbeille', './corbeille.html');
    }

    // Place l'icône dans une case spécifique
    addIcon(cellIndex, source, name, url) {
        const cells = this.desktop.querySelectorAll('.grid-cell');
        if (cells[cellIndex] && !cells[cellIndex].hasChildNodes()) {
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.draggable = true;
            if(source.indexOf("assets")===-1){
                icon.innerHTML = `
                <div class="icon-img">${source}</div>
                <span class="icon-label">${name}</span>
                `;
            }else{
                icon.innerHTML = `
                <div class="icon-img"><img src='${source}'></div>
                <span class="icon-label">${name}</span>
                `;
            }
            
            icon.addEventListener('dblclick', () => {
                if(specialNames.includes(name)){
                    window.open(url, '_blank').focus();
                }else new WindowApp(name, url);
            });

            cells[cellIndex].appendChild(icon);
        }
    }

    addFolder(cellIndex, source, name, content) {
        // Initialisation unique du contenu du dossier en mémoire
        if (!folderDOMs[name]) {
            const grid = document.createElement('div');
            grid.className = 'folder-content';
            
            content.forEach(item => {
                const icon = document.createElement('div');
                icon.className = 'desktop-icon';
                icon.draggable = true; 
                
                const imgContent = item.icon.indexOf("assets") === -1 
                    ? `<div class="icon-img">${item.icon}</div>` 
                    : `<div class="icon-img"><img src='${item.icon}'></div>`;

                icon.innerHTML = `
                    ${imgContent}
                    <span class="icon-label">${item.name}</span>
                `;
                
                icon.addEventListener('dblclick', () => {
                    if (item.name === "LinkedIn") {
                         window.open(item.url, '_blank').focus();
                    } else {
                         new WindowApp(item.name, item.url);
                    }
                });
                
                grid.appendChild(icon);
            });
            // Sauvegarde de l'élément HTML complet
            folderDOMs[name] = grid;
        }

        // Création de l'icône du dossier sur le bureau
        const cells = this.desktop.querySelectorAll('.grid-cell');
        if (cells[cellIndex]) {
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.draggable = true; // Rendre le dossier lui-même déplaçable
            icon.innerHTML = `<div class="icon-img">${source}</div><span class="icon-label">${name}</span>`;
            
            icon.addEventListener('dblclick', () => {
                // On transmet l'élément HTML en mémoire à FolderApp
                new FolderApp(name, folderDOMs[name]);
            });

            cells[cellIndex].appendChild(icon);
        }
    }

    // Configuration des écouteurs d'événements pour le drag&drop
    setupDragAndDrop() {
        this.desktop.addEventListener('dragstart', (e) => {
            const icon = e.target.closest('.desktop-icon');
            if (icon) {
                this.draggedIcon = icon;
                
                // Compatibilité inter-navigateurs
                e.dataTransfer.setData('text/plain', 'icon');
                e.dataTransfer.effectAllowed = 'move';
                
                setTimeout(() => icon.style.opacity = '0.4', 0);
            }
        });

        this.desktop.addEventListener('dragend', (e) => {
            if (this.draggedIcon) {
                this.draggedIcon.style.opacity = '1';
                this.draggedIcon = null;
            }
        });

        this.desktop.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.desktop.addEventListener('dragenter', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.grid-cell');
            const folder = e.target.closest('.folder-content');

            // On survole une case vide du bureau
            if (cell && !cell.querySelector('.desktop-icon')) {
                cell.classList.add('drag-over');
            } 
            // On survole l'intérieur d'un dossier ouvert
            else if (folder) {
                folder.classList.add('drag-over');
            }
        });

        this.desktop.addEventListener('dragleave', (e) => {
            const cell = e.target.closest('.grid-cell');
            const folder = e.target.closest('.folder-content');

            if (cell) cell.classList.remove('drag-over');
            if (folder) folder.classList.remove('drag-over');
        });

        this.desktop.addEventListener('drop', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.grid-cell');
            const folder = e.target.closest('.folder-content');
            
            // Dépôt sur la grille du bureau
            if (cell) {
                cell.classList.remove('drag-over');
                // On s'assure que la case est vide avant de lâcher l'icône
                if (!cell.querySelector('.desktop-icon') && this.draggedIcon) {
                    cell.appendChild(this.draggedIcon);
                }
            } 
            // Dépôt à l'intérieur d'un dossier
            else if (folder) {
                const targetWindow = folder.closest('.os-window');
                const targetFolderName = targetWindow.querySelector('.window-title').textContent;
                folder.classList.remove('drag-over');
                if (this.draggedIcon && this.draggedIcon.querySelector(".icon-label").textContent !== targetFolderName){
                    folder.appendChild(this.draggedIcon);
                }
            }
        });
    }
}

class FolderApp extends WindowApp {
    constructor(title, folderDOMElement) {
        // On appelle le constructeur parent, mais avec une URL vide
        super(title, "");
        this.folderDOMElement = folderDOMElement;
        this.renderFolderContent();
    }

    renderFolderContent() {
        const iframe = this.windowElement.querySelector('iframe');
        // On remplace l'iframe par notre grille pré-générée
        this.windowElement.replaceChild(this.folderDOMElement, iframe);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DesktopEnvironment('desktop');
});

const date = document.getElementById("date");
const heure = document.getElementById("hour");
setInterval(()=>{
    const currentDate = new Date();
    const currentDayOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    date.textContent = currentDayOfMonth + "/" + (currentMonth<10 ? "0":"") + (currentMonth + 1) + "/" + currentYear;

    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    hour.textContent = currentHour+":"+ (currentMinute<10 ? "0":"") +currentMinute;
},1000)