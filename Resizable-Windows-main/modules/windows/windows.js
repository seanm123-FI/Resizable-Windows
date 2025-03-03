// unit testing - function by function to see if the function works as expected, test for passes and fails
// integration testing - test the whole application to see if it works as expected, test for passes and fails 
// end to end testing - test the whole application to see if it works as expected, test for passes and fails

//Cypress and jest are the two most popular testing frameworks for javascript
//Cypress is used for end to end testing and jest is used for unit testing

let zIndexCounter = 0; // Initial z-index value
let allWindows = [];
const TOOLBAR_HEIGHT = 45;

const windowToolbar = `
    <div class="toolbar" role="toolbar" aria-label="Window management">     
        <input type="number" id="windowCount" placeholder="Number of windows" aria-label="Number of windows">
        <button id="createWindowButton" aria-label="Create Windows">Create Windows</button>
        <button id="clearWindowsButton" aria-label="Clear Windows">Clear Windows</button>
    </div>`;

    const windowTemplateString = `
    <div class="window" aria-labelledby="window-header-title" aria-describedby="window-content-description">
        <div class="window-header" tabindex="0">
            <span id="window-header-title" aria-label="Window Title">Window Title</span>
            <div class="window-controls"  aria-labelledby="window-controls-label">
                <span id="window-controls-label" class="visually-hidden"></span>
                <button class="button close-button" aria-label="Close Window">X</button>
                <button class="button extend-button" aria-label="Maximize Window">[ ]</button>
                <button class="button collapse-button" aria-label="Minimize Window">---</button>
            </div>
        </div>
        <div class="window-content" id="window-content-description">
            <p></p>
        </div>
        <div class="resizer top-left" role="separator" aria-label="Resize top-left corner" tabindex="0"></div>
        <div class="resizer top-right" role="separator" aria-label="Resize top-right corner" tabindex="0"></div>
        <div class="resizer bottom-left" role="separator" aria-label="Resize bottom-left corner" tabindex="0"></div>
        <div class="resizer bottom-right" role="separator" aria-label="Resize bottom-right corner" tabindex="0"></div>
        <div class="border-resizer top horizontal" role="separator" aria-label="Resize top border" tabindex="0"></div>
        <div class="border-resizer right vertical" role="separator" aria-label="Resize right border" tabindex="0"></div>
        <div class="border-resizer bottom horizontal" role="separator" aria-label="Resize bottom border" tabindex="0"></div>
        <div class="border-resizer left vertical" role="separator" aria-label="Resize left border" tabindex="0"></div>
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
            addKeyboardAccessibilityToResizers(windowElement);
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
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const width = windowWidth / cols;
        const height = (windowHeight - TOOLBAR_HEIGHT) / rows;
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
            // Add the following event listener to update zIndex when the window is clicked
    windowElement.addEventListener('mousedown', () => {
        updateZIndex(windowElement);
    });

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
                resizer.style.pointerEvents = 'auto';
                resizer.style.opacity = 1; // Ensure consistency
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
            resizer.style.pointerEvents = 'auto';
            resizer.style.opacity = 1; // Ensure consistency
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
        windowElement.style.height = `calc(100% - ${TOOLBAR_HEIGHT}px)`;
        windowElement.style.left = '0';
        windowElement.style.top = '0';
        windowElement.style.position = 'fixed';
        windowState.state = 'maximized';
    
        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        resizers.forEach(resizer => {
            resizer.style.pointerEvents = 'none';
            resizer.style.opacity = 1; // Ensure consistency
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
            resizer.style.pointerEvents = 'none';
            resizer.style.opacity = 1; // Ensure consistency
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
            resizer.style.pointerEvents = 'auto';
            resizer.style.opacity = 1; // Ensure consistency
        });
    
        saveState();
    };
    
    

    const collapseWindow = (windowElement, windowState, windowContent) => {
        windowElement.style.width = '200px';
        windowElement.style.height = '100px';
        windowElement.style.left = windowState.initialPosition.left;
        windowElement.style.top = windowState.initialPosition.top;
        windowContent.classList.add('hidden');
        windowState.state = 'collapsed';
        windowContent.style.pointerEvents = 'none';
    
        makeWindowDraggable(windowElement);
    
        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        resizers.forEach(resizer => {
            resizer.style.pointerEvents = 'none';
            resizer.style.opacity = 1; // Ensure consistency
        });
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
                newTop = Math.max(0, Math.min(newTop, window.innerHeight - windowElement.offsetHeight - TOOLBAR_HEIGHT));

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

    const addKeyboardAccessibilityToResizers = (windowElement) => {
        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        const minWidth  = 220;  
        const minHeight = 100;
        const step = 10;
        resizers.forEach(resizer => {
            resizer.addEventListener('keydown', (event) => {
            let newWidth, newHeight, newLeft, newTop;
            const startWidth = parseInt(windowElement.style.width, 10);
            const startHeight = parseInt(windowElement.style.height, 10);
            const startLeft = parseInt(windowElement.style.left, 10);
            const startTop = parseInt(windowElement.style.top, 10);

            switch (event.key) {
                case 'ArrowUp':
                    if (resizer.classList.contains('top') || resizer.classList.contains('top-left') || resizer.classList.contains('top-right')) {
                        newHeight = startHeight + step;
                        newTop = startTop - step;
                        if (newHeight > minHeight && newTop >= 0) {
                            windowElement.style.height = `${newHeight}px`;
                            windowElement.style.top = `${newTop}px`;
                        }
                    } else if (resizer.classList.contains('bottom') || resizer.classList.contains('bottom-left') || resizer.classList.contains('bottom-right')) {
                        newHeight = startHeight - step;
                        if (newHeight > minHeight && (startTop + newHeight) <= window.innerHeight - TOOLBAR_HEIGHT) {
                            windowElement.style.height = `${newHeight}px`;
                        }
                    }
                    break;
                    case 'ArrowDown':
                        if (resizer.classList.contains('top') || resizer.classList.contains('top-left') || resizer.classList.contains('top-right')) {
                            newHeight = startHeight - step;
                            newTop = startTop + step;
                            if (newHeight > minHeight && newTop >= 0) {
                                windowElement.style.height = `${newHeight}px`;
                                windowElement.style.top = `${newTop}px`;
                            }
                        } else if (resizer.classList.contains('bottom') || resizer.classList.contains('bottom-left') || resizer.classList.contains('bottom-right')) {
                            newHeight = startHeight + step;
                            if (newHeight > minHeight && (startTop + newHeight) <= window.innerHeight - TOOLBAR_HEIGHT) {
                                windowElement.style.height = `${newHeight}px`;
                            }
                        }
                        break;
                    case 'ArrowRight':
                        if (resizer.classList.contains('left') || resizer.classList.contains('top-left') || resizer.classList.contains('bottom-left')) {
                            newWidth = startWidth - step;
                            newLeft = startLeft + step;
                            if (newWidth > minWidth && newLeft >= 0) {
                                windowElement.style.width = `${newWidth}px`;
                                windowElement.style.left = `${newLeft}px`;
                            }
                        } else if (resizer.classList.contains('right') || resizer.classList.contains('top-right') || resizer.classList.contains('bottom-right')) {
                            newWidth = startWidth + step;
                            if (newWidth > minWidth && (startLeft + newWidth) <= window.innerWidth) {
                                windowElement.style.width = `${newWidth}px`;
                            }
                        }
                        break;
                    case 'ArrowLeft':
                        if (resizer.classList.contains('left') || resizer.classList.contains('top-left') || resizer.classList.contains('bottom-left')) {
                            newWidth = startWidth + step;
                            newLeft = startLeft - step;
                            if (newWidth > minWidth && newLeft >= 0) {
                                windowElement.style.width = `${newWidth}px`;
                                windowElement.style.left = `${newLeft}px`;
                            }
                        } else if (resizer.classList.contains('right') || resizer.classList.contains('top-right') || resizer.classList.contains('bottom-right')) {
                            newWidth = startWidth - step;
                            if (newWidth > minWidth && (startLeft + newWidth) <= window.innerWidth) {
                                windowElement.style.width = `${newWidth}px`;
                            }
                        }
                        break;
                    default:
                        break;
                }
                saveState(); // Ensure this function exists and updates the state
            });
        });
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

                    if (newHeight > minHeight && (startTop + newHeight) <= window.innerHeight - TOOLBAR_HEIGHT) {
                        windowElement.style.height = `${newHeight}px`;
                    }
                    break;

                case 'bottom-right':
                    newWidth = startWidth + dx;
                    newHeight = startHeight + dy;

                    if (newWidth > minWidth && (startLeft + newWidth) <= window.innerWidth) {
                        windowElement.style.width = `${newWidth}px`;
                    }
                    if (newHeight > minHeight && (startTop + newHeight) <= window.innerHeight - TOOLBAR_HEIGHT) {
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

                    if (newHeight > minHeight && (startTop + newHeight) <= window.innerHeight - TOOLBAR_HEIGHT) {
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

