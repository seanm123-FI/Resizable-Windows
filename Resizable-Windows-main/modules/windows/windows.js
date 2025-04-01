let zIndexCounter = 0; // Initial z-index value
let allWindows = [];
const TOOLBAR_HEIGHT = 45;

const windowToolbar = `
    <div class="toolbar">
        <input type="number" id="windowCount" placeholder="Number of windows" aria-label="Number of windows">
        <button id="createWindowButton" aria-label="Create Windows">Create Windows</button>
        <button id="clearWindowsButton" aria-label="Clear Windows">Clear Windows</button>
        <button id="loadBallsGameButton" aria-label="Load Balls Game">Load Balls Game</button>
        <button id="loadRegistrationFormButton" aria-label="Load Registration Form">Load Registration Form</button>
    </div>
    <div class="status-announcement visually-hidden" aria-live="assertive">
        <span id="activeWindowStatus"></span>
    </div>
    <div class="global-status-bar" aria-live="polite">
        <span id="globalStatusBar" role="status"></span>
    </div>`;

const windowTemplateString = `
    <div class="window" aria-labelledby="window-header-title" aria-describedby="window-content-description">
        <div class="window-header" tabindex="0">
            <span id="window-header-title"></span>
            <div class="window-controls">
                <span id="window-controls-label" class="visually-hidden"></span>
                <button class="button close-button"  tabindex="0">X</button>
                <button class="button extend-button" tabindex="0">[ ]</button>
                <button class="button collapse-button" tabindex="0">---</button>
                <button class="button pop-out-button" tabindex="0">Pop Out</button>
            </div>
        </div>
        <div class="window-content" id="window-content-description">
            <p></p>
            <div class="status-bar" aria-live="polite">
                <span id="myStatusBar" role="status"></span>
            </div>
        </div>
        <div class="resizer top-left" role="separator" tabindex="0"></div>
        <div class="resizer top-right" role="separator" tabindex="0"></div>
        <div class="resizer bottom-left" role="separator" tabindex="0"></div>
        <div class="resizer bottom-right" role="separator" tabindex="0"></div>
        <div class="border-resizer top horizontal" role="separator" tabindex="0"></div>
        <div class="border-resizer right vertical" role="separator" tabindex="0"></div>
        <div class="border-resizer bottom horizontal" role="separator" tabindex="0"></div>
        <div class="border-resizer left vertical" role="separator" tabindex="0"></div>
    </div>
`;

function announceActiveWindow(windowElement) {
    const globalStatusBar = document.getElementById('globalStatusBar');
    if (globalStatusBar) {
        globalStatusBar.classList.add('visually-hidden'); // Ensure it's visible
        globalStatusBar.innerText = `Active window: ${windowElement.innerText}`;
    }
}

function updateStatus(windowElement, newStatus = '', isGlobal = false) {
    if (isGlobal) {
        const globalStatusBar = document.getElementById('globalStatusBar');
        if (globalStatusBar) {
            globalStatusBar.classList.add('visually-hidden'); // Ensure it's visible
            globalStatusBar.innerText = newStatus;
        }
    } else {
        const statusBar = windowElement.querySelector('#myStatusBar');
        if (statusBar) {
            statusBar.classList.add('visually-hidden'); // Ensure it's visible
            statusBar.innerText = newStatus;
        }
    }
}

function addFocusEventListeners(windowElement) {
    const focusableElements = windowElement.querySelectorAll('[tabindex], .window-header, .window-content, .resizer, .border-resizer, .button');

    focusableElements.forEach(element => {
        element.addEventListener('focus', (event) => {
            let newStatus = '';

            if (element.classList.contains('window-header')) {
                newStatus = 'Window Header';
            } else if (element.tagName === 'BUTTON') {
                const ariaLabel = element.getAttribute('class');
                newStatus = ariaLabel ? ariaLabel : 'Button';
            } else if (element.classList.contains('resizer')) {
                const ariaLabel = element.getAttribute('class');
                newStatus = ariaLabel ? ariaLabel : 'Resizer';
            } else if (element.classList.contains('border-resizer')) {
                const ariaLabel = element.getAttribute('class');
                newStatus = ariaLabel ? ariaLabel : 'Border Resizer';
            } else if (element.classList.contains('window-content')) {
                newStatus = 'Window Content';
            } else {
                newStatus = 'Outer Window';
            }

            // Update local status bar
            updateStatus(windowElement, newStatus);

            // Announce the active window in the global status bar
            const windowTitle = windowElement.querySelector('#window-header-title').innerText;
            announceActiveWindow(windowElement);
        });
    });
}

function popOutWindowContent(windowElement) {
    console.log('Starting popOutWindowContent function');
    
    const windowContent = windowElement.querySelector('.window-content');
    if (!windowContent) {
        console.error('windowContent not found');
        return;
    }
    console.log('Found windowContent:', windowContent);

    const contentClone = windowContent.cloneNode(true);
    console.log('Cloned windowContent:', contentClone);

    // Open a new window
    const popOutWindow = window.open('', '', 'width=2000,height=1800');
    if (!popOutWindow) {
        console.error('Failed to open popOutWindow');
        return;
    }
    console.log('Opened new popOutWindow');

    // Create HTML structure for the new window's document
    popOutWindow.document.open();
    popOutWindow.document.write('<html><head><title>Pop Out Window</title></head><body></body></html>');
    popOutWindow.document.write('<style>body { margin: 0; padding: 0; overflow: hidden; }</style>');
    popOutWindow.document.write('</head><body></body></html>');
    popOutWindow.document.close();
    console.log('Written initial HTML structure to the new window');

    // Copy the styles from the parent window to the pop-out window
    const styles = Array.from(document.styleSheets);
    styles.forEach(styleSheet => {
        console.log('Processing stylesheet:', styleSheet.href);
        try {
            const rules = Array.from(styleSheet.cssRules);
            rules.forEach(rule => {
                const styleElement = popOutWindow.document.createElement('style');
                styleElement.innerHTML = rule.cssText;
                popOutWindow.document.head.appendChild(styleElement);
                console.log('Copied style rule:', rule.cssText);
            });
        } catch (e) {
            console.error('Error copying style rules', e);
        }
    });

    // Create a container div to hold the cloned content and maintain styles
    const containerDiv = popOutWindow.document.createElement('div');
    containerDiv.classList.add('window');
    containerDiv.innerHTML = windowElement.innerHTML; // Ensuring the content structure includes all

    // Set the container div to fill the new window
    containerDiv.style.width = '100%';
    containerDiv.style.height = '100%';
    containerDiv.style.position = 'absolute';
    containerDiv.style.top = '-50';
    containerDiv.style.left = '0';

    //Remove the window header in the container div of the popped out window
    const header = containerDiv.querySelector('.window-header');
    if(header){
        header.remove();
        console.log('Removed window header from the container div');
    }

    popOutWindow.document.body.appendChild(containerDiv);
    console.log('Appended cloned content to popOutWindow body inside container div');

    // Add detailed structure check
    console.log('Container structure:', containerDiv.innerHTML);

    // Ensure the container div has appropriate styles
    console.log('Computed styles for containerDiv:', window.getComputedStyle(containerDiv));

    // Create pop-in button
    const originalPopOutButton = windowElement.querySelector('.pop-out-button');
    const popInButton = popOutWindow.document.createElement('button');
    popInButton.innerText = 'Pop In';
    popInButton.className = originalPopOutButton.className;  // Apply same classes
    popInButton.style.cssText = originalPopOutButton.style.cssText;  // Apply same inline styles
    popInButton.addEventListener('click', () => {
        console.log('Pop In button clicked');
        popInWindowContent(popOutWindow, windowElement);
    });

    // Set the position of the pop-in button
    popInButton.style.position = 'absolute';
    popInButton.style.top = `10px`;
    popInButton.style.left = `1800px`;

    console.log(popInButton.style.top)
    console.log(popInButton.style.left)

    containerDiv.appendChild(popInButton); // Attach the button directly inside the container div
    console.log('Appended Pop In button to popOutWindow body');

    // Hide the content in the original window
    windowContent.style.display = 'none';
    console.log('Set original window content to display: none');
}

// Helper function for logging during Pop In
function popInWindowContent(popOutWindow, originalWindow) {
    console.log('Starting popInWindowContent function');

    const originalContentArea = originalWindow.querySelector('.window-content');
    if (!originalContentArea) {
        console.error('originalContentArea not found');
        return;
    }

    originalContentArea.innerHTML = popOutWindow.document.querySelector('.window-content').innerHTML;
    originalContentArea.style.display = 'block';
    console.log('Restored content to the original window');

    popOutWindow.close();
    console.log('Closed popOutWindow');

    addEventListenersToRestoredContent(originalWindow);
    console.log('Readded event listeners to the restored content');
}

function addEventListenersToRestoredContent(windowElement) {
    // Re-add any event listeners to the restored content.
    makeWindowDraggable(windowElement);
    makeWindowResizable(windowElement);
    makeWindowBordersResizable(windowElement);
}

const mainFunc = () => {
    document.body.innerHTML = windowToolbar;
    const createWindowButton = document.getElementById('createWindowButton');
    const windowCountInput = document.getElementById('windowCount');
    const clearWindowsButton = document.getElementById('clearWindowsButton');
    const loadBallsGameButton =  document.getElementById('loadBallsGameButton');
    const loadRegistrationFormButton = document.getElementById('loadRegistrationFormButton');

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

    const updateZIndexForNewWindow = (newWindowElement) => {
        // Set the new window to the highest z-index
        newWindowElement.style.zIndex = ++zIndexCounter;
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
        updateStatus(null, `Created ${windowCount} windows`, true);
    });

    const createWindows = (count) => {
        allWindows.forEach(winState => winState.windowElement.remove());
        allWindows = [];

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const savedState = loadState();

        for (let i = 0; i < count; i++) {
            const windowElement = createWindowElement();
            console.log('windowElement:', windowElement);

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
                    windowElement.style.width = `${width}px`;
                    windowElement.style.height = `${height}px`;
                }
                windowElement.style.zIndex = savedState[i].zIndex;
            } else {
                windowElement.style.left = `${left}px`;
                windowElement.style.top = `${top}px`;
                windowElement.style.width = `${width}px`;
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

            // Add focus event listeners
            addFocusEventListeners(windowElement);

            windowElement.addEventListener('focus', () => {
                updateZIndex(windowElement);
                const windowTitle = windowElement.querySelector('#window-header-title').innerText;
                announceActiveWindow(windowElement);
            }, true);
        }
        saveState();
    };

    clearWindowsButton.addEventListener('click', () => {
        allWindows.forEach(winState => winState.windowElement.remove());
        allWindows = [];
        localStorage.removeItem('windowsState');
        zIndexCounter = 0;
        updateStatus(null, 'Cleared all windows', true);
    });

    loadBallsGameButton.addEventListener('click', () => {
        const gameWindow = createWindowForBallsGame();
        updateZIndex(gameWindow);
    });

    loadRegistrationFormButton.addEventListener('click', () => {
        const formWindow = createWindowForRegistrationForm();
        updateZIndex(formWindow);
    })
    
    function createWindowForBallsGame() {
        const gameWindow = createWindowElement();
         
        const gameContent = gameWindow.querySelector('.window-content');
        const iframeSrc = "./modules/Random-Spheres/index.html"; // Ensure the path is correct
        gameContent.innerHTML = `
            <iframe id="ballsGameIframe"
            src="${iframeSrc}" 
            style="width: 100%; height: 100%; border: none;"></iframe>`;

        // Set initial position if not set
        gameWindow.style.left = `${Math.max(0, (window.innerWidth - 400) / 2)}px`;
        gameWindow.style.top = `${Math.max(0, (window.innerHeight - 300) / 2)}px`;
        
        document.body.appendChild(gameWindow);
    
        // Ensure the new window is immediately brought to front
        updateZIndexForNewWindow(gameWindow);
        
        const windowState = {
            windowElement: gameWindow,
            state: 'normal',
            initialPosition: {
                width: gameWindow.style.width,
                height: gameWindow.style.height,
                left: gameWindow.style.left,
                top: gameWindow.style.top
            }
        };
        
        allWindows.push(windowState);
        addWindowEventListeners(gameWindow, windowState);
        makeWindowDraggable(gameWindow);
        makeWindowResizable(gameWindow);
        makeWindowBordersResizable(gameWindow);
        addFocusEventListeners(gameWindow);
        updateZIndex(gameWindow);
    
        const iframe = gameContent.querySelector('#ballsGameIframe');
        iframe.addEventListener('load', () => {
            console.log("Iframe loaded successfully");
            // Allow text selection within the iframe
            try {
                iframe.contentDocument.body.style.userSelect = 'auto';
                
                // Prevent parent window dragging while interacting with game content
                const stopParentDrag = (event) => {
                    event.stopPropagation();
                };
                iframe.contentWindow.addEventListener('mousedown', stopParentDrag);
                iframe.contentWindow.addEventListener('mousemove', stopParentDrag);
                iframe.contentWindow.addEventListener('mouseup', stopParentDrag);
                
            } catch (e) {
                console.error("Iframe content is not accessible:", e);
            }
        });
    
        iframe.addEventListener('error', () => {
            console.error("Error loading iframe content. Check the path and ensure the file exists.");
        });
            
        return gameWindow; // Return the created window element for further use.
    }
    
    function createWindowForRegistrationForm() {
        const formWindow = createWindowElement();

        const formContent = formWindow.querySelector('.window-content');
        const iframeSrc = "./modules/registration-form/index.html"; // Ensure the path is correct
        formContent.innerHTML = `
            <iframe id="registrationFormIframe"
            src="${iframeSrc}" 
            style="width: 100%; height: 100%; border: none;"></iframe>`;

        // Set initial position if not set
        formWindow.style.left = `${Math.max(0, (window.innerWidth - 400) / 2)}px`;
        formWindow.style.top = `${Math.max(0, (window.innerHeight - 300) / 2)}px`;
        
        document.body.appendChild(formWindow);
    
        // Ensure the new window is immediately brought to front
        updateZIndexForNewWindow(formWindow);


        const windowState = {
            windowElement: formWindow,
            state: 'normal',
            initialPosition: {
                width: formWindow.style.width,
                height: formWindow.style.height,
                left: formWindow.style.left,
                top: formWindow.style.top
            }
        };
        
        allWindows.push(windowState);
        addWindowEventListeners(formWindow, windowState);
        makeWindowDraggable(formWindow);
        makeWindowResizable(formWindow);
        makeWindowBordersResizable(formWindow);
        addFocusEventListeners(formWindow);
        updateZIndex(formWindow);
    
        const iframe = gameContent.querySelector('#registrationFormIframe');
        iframe.addEventListener('load', () => {
            console.log("Iframe loaded successfully");
            // Allow text selection within the iframe
            try {
                iframe.contentDocument.body.style.userSelect = 'auto';
                
                // Prevent parent window dragging while interacting with game content
                const stopParentDrag = (event) => {
                    event.stopPropagation();
                };
                iframe.contentWindow.addEventListener('mousedown', stopParentDrag);
                iframe.contentWindow.addEventListener('mousemove', stopParentDrag);
                iframe.contentWindow.addEventListener('mouseup', stopParentDrag);
                
            } catch (e) {
                console.error("Iframe content is not accessible:", e);
            }
        });
    
        iframe.addEventListener('error', () => {
            console.error("Error loading iframe content. Check the path and ensure the file exists.");
        });
            
        return formWindow; // Return the created window element for further use.
    }
    
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
        const popOutButton = windowElement.querySelector('.pop-out-button');
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

        if (popOutButton) {
            popOutButton.addEventListener('click', () => {
                popOutWindowContent(windowElement);
                saveState();
            });
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
        });

        disableWindowDraggable(windowElement);
        disableWindowResizable(windowElement);

        const windowContent = windowElement.querySelector('.window-content');
        windowContent.style.pointerEvents = 'auto';  //updated to auto to allow selection for the loaded content
        windowContent.style.userSelect = 'auto';
        windowContent.contentDocument.body.style.userSelect = 'auto'; // Ensure content body can be interacted with
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
        windowElement.style.width = '380px';
        windowElement.style.height = '150px';
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
    
                startLeft = parseFloat(windowElement.style.left) || 0;
                startTop = parseFloat(windowElement.style.top) || 0;
    
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
        const minWidth = 380;
        const minHeight = 150;
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
                saveState();
            });
        });
    };

    const makeWindowResizable = (windowElement) => {
        const resizers = windowElement.querySelectorAll('.resizer');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop, resizer;
        const minWidth = 380;
        const minHeight = 150;
    
        // Convert style values to numbers and any undefined values default to the predefined min value
        const parseStyleValue = (value, defaultValue) => {
            const parsedValue = parseFloat(value);
            return isNaN(parsedValue) ? defaultValue : parsedValue;
        };
    
        const onMouseDown = (event) => {
            event.preventDefault();
            event.stopPropagation();
    
            isResizing = true;
            startX = event.clientX;
            startY = event.clientY;
            startWidth = parseStyleValue(windowElement.style.width, minWidth);
            startHeight = parseStyleValue(windowElement.style.height, minHeight);
            startLeft = parseStyleValue(windowElement.style.left, windowElement.offsetLeft);
            startTop = parseStyleValue(windowElement.style.top, windowElement.offsetTop);
            resizer = event.target.closest('.resizer');
            
            console.log(`Mouse down on resizer: ${resizer.classList.value}`, { startX, startY, startWidth, startHeight, startLeft, startTop });
    
            // Prevent iframe from capturing events
            const iframe = windowElement.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'none';
            }
    
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
    
            console.log(`Mouse move on resizer: ${resizer.classList.value}`, { dx, dy, newWidth, newHeight, newLeft, newTop });
        };
    
        const onMouseUp = () => {
            isResizing = false;
            document.body.classList.remove('noselect');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
    
            // Re-enable iframe interactions
            const iframe = windowElement.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'auto';
            }
    
            console.log(`Mouse up on resizer: ${resizer.classList.value}`);
            saveState();
        };
    
        resizers.forEach(resizer => {
            console.log(`Adding listener to resizer: ${resizer.classList.value}`);
            resizer.addEventListener('mousedown', onMouseDown);
        });
    };
    
    const makeWindowBordersResizable = (windowElement) => {
        const borderResizers = windowElement.querySelectorAll('.border-resizer');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop, borderResizer;
        const minWidth = 380;
        const minHeight = 150;
    
        // Convert style values to numbers and any undefined values default to the predefined min value
        const parseStyleValue = (value, defaultValue) => {
            const parsedValue = parseFloat(value);
            return isNaN(parsedValue) ? defaultValue : parsedValue;
        };
    
        const onMouseDown = (event) => {
            isResizing = true;
            startX = event.clientX;
            startY = event.clientY;
    
            startWidth = parseStyleValue(windowElement.style.width, minWidth);
            startHeight = parseStyleValue(windowElement.style.height, minHeight);
            startLeft = parseStyleValue(windowElement.style.left, windowElement.offsetLeft);
            startTop = parseStyleValue(windowElement.style.top, windowElement.offsetTop);
            borderResizer = event.target.closest('.border-resizer');
    
            console.log(`Mouse down on border resizer: ${borderResizer.classList.value}`, { startX, startY, startWidth, startHeight, startLeft, startTop });
    
            // Prevent iframe from capturing events
            const iframe = windowElement.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'none';
            }
    
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
    
            console.log(`Mouse move on border resizer: ${borderResizer.classList.value}`, { dx, dy, newWidth, newHeight, newLeft, newTop });
        };
    
        const onMouseUp = () => {
            isResizing = false;
            document.body.classList.remove('noselect');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
    
            // Re-enable iframe interactions
            const iframe = windowElement.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'auto';
            }
    
            console.log(`Mouse up on border resizer: ${borderResizer.classList.value}`);
            saveState();
        };
    
        borderResizers.forEach(borderResizer => {
            console.log(`Adding listener to border resizer: ${borderResizer.classList.value}`);
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

(() => {
    mainFunc();
})();
