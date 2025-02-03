let zIndexCounter = 0; // Initial z-index value
let allWindows = [];

const windowToolbar = `
    <div class="toolbar">
        <input type="number" id="windowCount" placeholder="Number of windows" min="1">
        <button id="createWindowButton">Create Windows</button>
        <button id="clearWindowsButton">Clear Windows</button>
    </div>`;

    const windowTemplateString = `
        <div class="window">
            <div class="window-header">
                <span id="window-header-title">My Window</span>
                <div class="window-controls">
                    <button class="button close-button">X</button>
                    <button class="button extend-button">[ ]</button>
                    <button class="button collapse-button">-</button>
                </div>
            </div>
            <div class="window-content">
                <p>This is a resizable window.</p>
            </div>
            <svg class="resizer top-left" width="20" height="20">
                <path d="M20,0 L0,0 L0,20" stroke="#F4C430" stroke-width="10" fill="none"/>
            </svg>
            <svg class="resizer top-right" width="20" height="20">
                <path d="M0,0 L20,0 L20,20" stroke="#F4C430" stroke-width="10" fill="none"/>
            </svg>
            <svg class="resizer bottom-left" width="20" height="20">
                <path d="M0,0 L0,20 L20,20" stroke="#F4C430" stroke-width="10" fill="none"/>
            </svg>
            <svg class="resizer bottom-right" width="20" height="20">
                <path d="M0,20 L20,20 L20,0" stroke="#F4C430" stroke-width="10" fill="none"/>
            </svg>
            <div class="border-resizer top horizontal"></div>
            <div class="border-resizer right vertical"></div>
            <div class="border-resizer bottom horizontal"></div>
            <div class="border-resizer left vertical"></div>
        </div>
      `;



const mainFunc = () => {
    document.body.innerHTML = windowToolbar ;
    const createWindowButton = document.getElementById('createWindowButton');
    const windowCountInput = document.getElementById('windowCount');
    const clearWindowsButton = document.getElementById('clearWindowsButton');
    
    const myScript = document.createElement('script');
    document.head.appendChild(myScript);
    document.head.removeChild(myScript);

    const saveState = () => {
        const state = allWindows.map(winState => ({
            state: winState.state,
            position: {
                left: winState.windowElement.style.left,
                top: winState.windowElement.style.top,
                width: winState.windowElement.style.width,
                height: winState.windowElement.style.height
            },
            zIndex: winState.windowElement.style.zIndex
        }));
        localStorage.setItem('windowsState', JSON.stringify(state));
    };

    const loadState = () => {
        const savedState = localStorage.getItem('windowsState');
        return savedState ? JSON.parse(savedState) : [];
    };

    const updateZIndex = (clickedWindow) => {
        const indexToRemove = allWindows.findIndex(winState => winState.windowElement === clickedWindow);
        const removedWindow = allWindows.splice(indexToRemove, 1)[0];
        allWindows.push(removedWindow);
        allWindows.forEach((winState, index) => {
            winState.windowElement.style.zIndex = index + 1;
        });
    };

    createWindowButton.addEventListener('click', () => {
        const windowCount = parseInt(windowCountInput.value) || 1;
        createWindows(windowCount);
    });

    const createWindows = (count) => {
        allWindows.forEach(winState => winState.windowElement.remove());
        allWindows = [];
    
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const savedState = loadState();
    
        for (let i = 0; i < count; i++) {
            const windowElement = createWindowElement();
            console.log('windowElement:', windowElement); // Debugging log
    
            if (!windowElement) {
                console.error('Failed to create windowElement.');
                continue; // Skip to the next iteration
            }
    
            const [left, top, width, height] = calcWindowPosition(i, count, windowWidth, windowHeight);
    
            if (savedState[i]) {
                const { left: savedLeft, top: savedTop, width: savedWidth, height: savedHeight } = savedState[i].position;
                if (savedLeft && savedTop && savedWidth && savedHeight) {
                    windowElement.style.left = savedLeft;
                    windowElement.style.top = savedTop;
                    windowElement.style.width = savedWidth;
                    windowElement.style.height = savedHeight;
                } else {
                    windowElement.style.left = `${left}px`;
                    windowElement.style.top = `${top}px`;
                    windowElement.style.width = `${width }px`;
                    windowElement.style.height = `${height }px`;
                }
                windowElement.style.zIndex = savedState[i].zIndex;
            } else {
                windowElement.style.left = `${left}px`;
                windowElement.style.top = `${top}px`;
                windowElement.style.width = `${width }px`;
                windowElement.style.height = `${height}px`;
                windowElement.style.zIndex = zIndexCounter++;
            }
    
            document.body.appendChild(windowElement);
    
            const windowState = {
                windowElement,
                state: savedState[i]?.state || 'normal',
                initialPosition: {
                    width: windowElement.style.width,
                    height: windowElement.style.height,
                    left: windowElement.style.left,
                    top: windowElement.style.top
                }
            };
    
            allWindows.push(windowState);
            addWindowEventListeners(windowElement, windowState);
            makeWindowDraggable(windowElement);
            makeWindowResizable(windowElement);
            makeWindowBordersResizable(windowElement);
        }
        saveState();
    };
    

    clearWindowsButton.addEventListener('click', () => {
        allWindows.forEach(winState => winState.windowElement.remove());
        allWindows = [];
        localStorage.removeItem('windowsState');
        zIndexCounter = 0;
    });

    const calcWindowPosition = (index, count, windowWidth, windowHeight) => {
        const toolbarHeight = 50;
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const width = windowWidth / cols;
        const height = (windowHeight - toolbarHeight) / rows;
        const row = Math.floor(index / cols);
        const col = index % cols;
        const isLastRow = row === rows - 1;
        const remainingColsInLastRow = count % cols || cols;
        if (isLastRow && remainingColsInLastRow !== cols) {
            const adjustedWidth = windowWidth / remainingColsInLastRow;
            return [col * adjustedWidth, row * height, adjustedWidth, height];
        }
        return [col * width, row * height, width, height];
    };

    const createWindowElement = () => {
        const template = document.createElement('div');
        template.innerHTML = windowTemplateString.trim();
        const windowElement = template.querySelector('.window');
        console.log('windowElement:', windowElement); // Debugging log to inspect the windowElement
        return windowElement;
    };
    
    

    const addWindowEventListeners = (windowElement, windowState) => {
        console.log('windowElement:', windowElement); // Debugging log
    
        const closeButton = windowElement.querySelector('.close-button');
        const extendButton = windowElement.querySelector('.extend-button');
        const collapseButton = windowElement.querySelector('.collapse-button');
        const windowContent = windowElement.querySelector('.window-content');
    
        console.log('closeButton:', closeButton);
        console.log('extendButton:', extendButton);
        console.log('collapseButton:', collapseButton);
    
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                closeWindow(windowElement);
                saveState();
            });
        } else {
            console.error('closeButton is null');
        }
    
        if (extendButton) {
            extendButton.addEventListener('click', () => {
                toggleExtendWindow(windowElement, windowState, windowContent);
                saveState();
            });
        } else {
            console.error('extendButton is null');
        }
    
        if (collapseButton) {
            collapseButton.addEventListener('click', () => {
                toggleCollapseWindow(windowElement, windowState, windowContent);
                saveState();
            });
        } else {
            console.error('collapseButton is null');
        }
    
        const header = windowElement.querySelector('.window-header');
        if (header) {
            header.onmousedown = onMouseDown;
            header.style.cursor = 'move';
        } else {
            console.error('Header element is not found.');
        }
        
        function onMouseDown(event) {
            if (event.target.closest('.window-header')) {
                // omitted for brevity
            }
        };
    };

    const closeWindow = (windowElement) => {
        windowElement.remove();
        allWindows = allWindows.filter(win => win.windowElement !== windowElement);
    };

    const toggleExtendWindow = (windowElement, windowState, windowContent) => {
        if (windowState.state === 'maximized' || windowState.state === 'collapsed') {
            restoreToNormal(windowElement, windowState);

            const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
            resizers.forEach(resizer => {
                resizer.style.display = 'block';
            });
        } else {
            extendWindow(windowElement, windowState);
        }
        saveState();
    };

    const restoreToNormal = (windowElement, windowState) => {
        windowElement.style.width = windowState.initialPosition.width;
        windowElement.style.height = windowState.initialPosition.height;
        windowElement.style.left = windowState.initialPosition.left;
        windowElement.style.top = windowState.initialPosition.top;
        windowElement.style.position = 'absolute';
        windowState.state = 'normal';

        const windowContent = windowElement.querySelector('.window-content');
        windowContent.classList.remove('hidden');
        windowContent.style.pointerEvents = 'auto';

        makeWindowDraggable(windowElement);
        makeWindowResizable(windowElement);
        makeWindowBordersResizable(windowElement);

        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        resizers.forEach(resizer => {
            resizer.style.display = 'block';
        });

        saveState();
    };

    const extendWindow = (windowElement, windowState) => {
        windowState.initialPosition = {
            width: windowElement.style.width,
            height: windowElement.style.height,
            left: windowElement.style.left,
            top: windowElement.style.top
        };
        windowElement.style.width = '100%';
        windowElement.style.height = '100%';
        windowElement.style.left = '0';
        windowElement.style.top = '0';
        windowElement.style.position = 'fixed';
        windowState.state = 'maximized';

        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        resizers.forEach(resizer => {
            resizer.style.display = 'none';
        });

        disableWindowDraggable(windowElement);
        disableWindowResizable(windowElement);

        const windowContent = windowElement.querySelector('.window-content');
        windowContent.style.pointerEvents = 'none';
        saveState();
    };

    const disableWindowDraggable = (windowElement) => {
        const header = windowElement.querySelector('.window-header');
        if (header) {
            header.style.cursor = 'default';
            header.onmousedown = null;
        }
    };

    const disableWindowResizable = (windowElement) => {
        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        resizers.forEach(resizer => {
            resizer.style.display = 'none';
        });
    };

    const toggleCollapseWindow = (windowElement, windowState, windowContent) => {
        if (windowContent) {
            if (windowState.state === 'collapsed') {
                restoreCollapsedWindow(windowElement, windowState, windowContent);
            } else {
                if (windowState.state !== 'collapsed') {
                    windowState.initialPosition = {
                        width: windowElement.style.width,
                        height: windowElement.style.height,
                        left: windowElement.style.left,
                        top: windowElement.style.top
                    };
                }
                collapseWindow(windowElement, windowState, windowContent);
            }
            saveState();
        } else {
            console.error('windowContent is null');
        }
    };

    const restoreCollapsedWindow = (windowElement, windowState, windowContent) => {
        windowContent.classList.remove('hidden');
        windowElement.style.width = windowState.initialPosition.width;
        windowElement.style.height = windowState.initialPosition.height;
        windowElement.style.left = windowState.initialPosition.left;
        windowElement.style.top = windowState.initialPosition.top;
        windowElement.style.position = 'absolute';
        windowState.state = 'normal';

        makeWindowDraggable(windowElement);
        makeWindowResizable(windowElement);
        makeWindowBordersResizable(windowElement);

        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        resizers.forEach(resizer => {
            resizer.style.display = 'block';
        });

        saveState();
    };

    const collapseWindow = (windowElement, windowState, windowContent) => {
        windowElement.style.width = '220px';
        windowElement.style.height = '60px';
        windowElement.style.left = windowState.initialPosition.left;
        windowElement.style.top = windowState.initialPosition.top;
        windowContent.classList.add('hidden');
        windowState.state = 'collapsed';
        windowContent.style.pointerEvents = 'none';

        makeWindowDraggable(windowElement);
        disableWindowResizable(windowElement);

        saveState();
    };

    const makeWindowDraggable = (windowElement) => {
        let isDragging = false, startX, startY, startLeft, startTop;

        const onMouseDown = (event) => {
            if (event.target.closest('.window-header')) {
                isDragging = true;
                startX = event.clientX;
                startY = event.clientY;

                startLeft = parseInt(windowElement.style.left || 0, 10);
                startTop = parseInt(windowElement.style.top || 0, 10);

                document.body.classList.add('noselect');

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                event.preventDefault();
            }
        };

        const onMouseMove = (event) => {
            if (isDragging) {
                const dx = event.clientX - startX;
                const dy = event.clientY - startY;

                let newLeft = startLeft + dx;
                let newTop = startTop + dy;

                newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - windowElement.offsetWidth));
                newTop = Math.max(0, Math.min(newTop, window.innerHeight - windowElement.offsetHeight));

                windowElement.style.left = `${newLeft}px`;
                windowElement.style.top = `${newTop}px`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            document.body.classList.remove('noselect');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            saveState();
        };

        const header = windowElement.querySelector('.window-header');
        if (header) {
            header.onmousedown = onMouseDown;
            header.style.cursor = 'move';
        } else {
            console.error('Header element is not found.');
        }
    };

    const makeWindowResizable = (windowElement) => {
        const resizers = windowElement.querySelectorAll('.resizer');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop, resizer;
        const minWidth = 220;
        const minHeight = 100;

        const onMouseDown = (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (windowElement.style.position === 'fixed') return;
            isResizing = true;
            startX = event.clientX;
            startY = event.clientY;
            startWidth = parseInt(windowElement.style.width, 10);
            startHeight = parseInt(windowElement.style.height, 10);
            startLeft = parseInt(windowElement.style.left, 10);
            startTop = parseInt(windowElement.style.top, 10);
            resizer = event.target.closest('.resizer');

            updateZIndex(windowElement);
            document.body.classList.add('noselect');
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (event) => {
            if (!isResizing) return;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            let newWidth, newHeight, newLeft, newTop;

            // Determine the resizer being dragged and update the window size accordingly
    switch (resizer.classList[1]) {
                case 'top-left':
                    newWidth = startWidth - dx;
                    newHeight = startHeight - dy;
                    newLeft = startLeft + dx;
                    newTop = startTop + dy;

                    if (newWidth > minWidth && newLeft >= 0) {
                        windowElement.style.width = `${newWidth}px`;
                        windowElement.style.left = `${newLeft}px`;
                    }

                    if (newHeight > minHeight && newTop >= 0) {
                        windowElement.style.height = `${newHeight}px`;
                        windowElement.style.top = `${newTop}px`;
                    }
                    break;

                case 'top-right':
                    newWidth = startWidth + dx;
                    newHeight = startHeight - dy;
                    newTop = startTop + dy;

                    if (newWidth > minWidth && (startLeft + newWidth) <= window.innerWidth) {
                        windowElement.style.width = `${newWidth}px`;
                    }

                    if (newHeight > minHeight && newTop >= 0) {
                        windowElement.style.height = `${newHeight}px`;
                        windowElement.style.top = `${newTop}px`;
                    }
                    break;

                case 'bottom-left':
                    newWidth = startWidth - dx;
                    newHeight = startHeight + dy;
                    newLeft = startLeft + dx;

                    if (newWidth > minWidth && newLeft >= 0) {
                        windowElement.style.width = `${newWidth}px`;
                        windowElement.style.left = `${newLeft}px`;
                    }

                    if (newHeight > minHeight && (startTop + newHeight) <= window.innerHeight) {
                        windowElement.style.height = `${newHeight}px`;
                    }
                    break;

                case 'bottom-right':
                    newWidth = startWidth + dx;
                    newHeight = startHeight + dy;

                    if (newWidth > minWidth && (startLeft + newWidth) <= window.innerWidth) {
                        windowElement.style.width = `${newWidth}px`;
                    }
                    if (newHeight > minHeight && (startTop + newHeight) <= window.innerHeight) {
                        windowElement.style.height = `${newHeight}px`;
                    }
                    break;
            }
        };

        const onMouseUp = () => {
            isResizing = false;
            document.body.classList.remove('noselect');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            saveState();
        };

        resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', onMouseDown);
        });
    };

    const makeWindowBordersResizable = (windowElement) => {
        const borderResizers = windowElement.querySelectorAll('.border-resizer');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop, borderResizer;
        const minWidth = 220;
        const minHeight = 100;

        const onMouseDown = (event) => {
            isResizing = true;
            startX = event.clientX;
            startY = event.clientY;

            startWidth = parseInt(windowElement.style.width, 10);
            startHeight = parseInt(windowElement.style.height, 10);
            startLeft = parseInt(windowElement.style.left, 10);
            startTop = parseInt(windowElement.style.top, 10);
            borderResizer = event.target.closest('.border-resizer');

            updateZIndex(windowElement);

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            event.preventDefault();
        };

        const onMouseMove = (event) => {
            if (!isResizing) return;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            let newWidth, newHeight, newLeft, newTop;

            switch (borderResizer.classList[1]) {
                case 'top':
                    newHeight = startHeight - dy;
                    newTop = startTop + dy;

                    if (newHeight > minHeight && newTop >= 0) {
                        windowElement.style.height = `${newHeight}px`;
                        windowElement.style.top = `${newTop}px`;
                    }
                    break;

                case 'bottom':
                    newHeight = startHeight + dy;

                    if (newHeight > minHeight && (startTop + newHeight) <= window.innerHeight) {
                        windowElement.style.height = `${newHeight}px`;
                    }
                    break;

                case 'left':
                    newWidth = startWidth - dx;
                    newLeft = startLeft + dx;

                    if (newWidth > minWidth && newLeft >= 0) {
                        windowElement.style.width = `${newWidth}px`;
                        windowElement.style.left = `${newLeft}px`;
                    }
                    break;

                case 'right':
                    newWidth = startWidth + dx;

                    if (newWidth > minWidth && (startLeft + newWidth) <= window.innerWidth) {
                        windowElement.style.width = `${newWidth}px`;
                    }
                    break;
            }
        };

        const onMouseUp = () => {
            isResizing = false;
            document.body.classList.remove('noselect'); 
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            saveState();
        };

        borderResizers.forEach(borderResizer => {
            borderResizer.style.display = 'block'; 
            borderResizer.addEventListener('mousedown', onMouseDown);
        });
    };

    window.addEventListener('load', () => {
        const savedState = loadState();
        if (savedState.length > 0) {
            createWindows(savedState.length); 
        } else {
            createWindows(1); 
        }
    });
};

console.log(performance.memory);

(() => {
    mainFunc();
})();

/*
  Summary of Fixes and Solutions:

  1. Removed nested <template> tags to ensure correct parsing of HTML elements.
  2. Simplified the createWindowElement function to correctly extract and return the .window element from the parsed string.
  3. Controlled initial content load by only appending the toolbar to the document body initially and ensuring windows are created based on user interaction or restored state.

  These changes ensure correct element identification, avoid unintended content load, and restrict window creation to intended actions.
*/
