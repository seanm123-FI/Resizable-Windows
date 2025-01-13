let zIndexCounter = 0; // Initial z-index value
let allWindows = [];

// Event listener for when the content is loaded
document.addEventListener('DOMContentLoaded', () => {
    const createWindowButton = document.getElementById('createWindowButton');
    const windowCountInput = document.getElementById('windowCount');
    const windowTemplate = document.getElementsByClassName('window-template')?.[0] ?? null;
    const clearWindowsButton = document.getElementById('clearWindowsButton');

    const myScript = document.createElement('script');
    document.head.appendChild(myScript);
    document.head.removeChild(myScript);

    //function to save the state of the windows
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
        //converts array into a json string and stores it in local storage under the key 'windowsState
        localStorage.setItem('windowsState', JSON.stringify(state));
    };

    //loads the previously daved state of all the windows from the local storage
    const loadState = () => {
        //get window state from local storage
        const savedState = localStorage.getItem('windowsState');
        //parse the json string into an array of objects and return it, else return an empty array if no saved state is found
        return savedState ? JSON.parse(savedState) : [];
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

        //loading in the previously saved state of the windows
        const savedState = loadState();

        for (let i = 0; i < count; i++) {
            const windowElement = createWindowElement();
            const [left, top, width, height] = calcWindowPosition(i, count, windowWidth, windowHeight);

            //if there is a saved state for the window, load all of the saved windows and positions, else create a new window
            if (savedState[i]) {
                const { left: savedLeft, top: savedTop, width: savedWidth, height: savedHeight } = savedState[i].position;
                windowElement.style.left = savedLeft;
                windowElement.style.top = savedTop;
                windowElement.style.width = savedWidth;
                windowElement.style.height = savedHeight;
                windowElement.style.zIndex = savedState[i].zIndex;
            } else {
                windowElement.style.left = `${left}px`;
                windowElement.style.top = `${top}px`;
                windowElement.style.width = `${width - 5}px`;
                windowElement.style.height = `${height - 5}px`;
                windowElement.style.zIndex = zIndexCounter++;
            }
            document.body.appendChild(windowElement);

            //create a new window state object and add it to the allWindows array
            const windowState = {
                //save the window element
                windowElement,
                //if there is a saved state for the window, load the saved state, else set the state to normal
                state: savedState[i]?.state || 'normal',
                //save the initial position of the window
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
        //save the state of the windows
        saveState();
    };

    clearWindowsButton.addEventListener('click', () => {
        allWindows.forEach(winState => winState.windowElement.remove());
        allWindows = [];
        //clear the saved state of the windows
        localStorage.removeItem('windowsState');
        zIndexes = [];
        zIndexCounter
    }
    );


    const calcWindowPosition = (index, count, windowWidth, windowHeight) => {
        const toolbarHeight = 50; // Fixed toolbar height

        // Calculate the number of columns and rows
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);

        // Recalculate window height considering the toolbar height
        const width = windowWidth / cols;
        const height = (windowHeight - toolbarHeight) / rows;

        // Calculate the row and column position
        const row = Math.floor(index / cols);
        const col = index % cols;

        // Adjust width for the last uneven row
        const isLastRow = row === rows - 1;
        const remainingColsInLastRow = count % cols || cols;
        if (isLastRow && remainingColsInLastRow !== cols) {
            const adjustedWidth = windowWidth / remainingColsInLastRow;
            return [col * adjustedWidth, row * height, adjustedWidth, height];
        }

        // Return the calculated left, top, width, and height for the window
        return [col * width, row * height, width, height];
    };

    const createWindowElement = () => {
        const windowElement = document.importNode(windowTemplate.content, true).querySelector('.window');
        windowElement.style.position = 'absolute';
        return windowElement;
    };

    const addWindowEventListeners = (windowElement, windowState) => {
        const closeButton = windowElement.querySelector('.close-button');
        const extendButton = windowElement.querySelector('.extend-button');
        const collapseButton = windowElement.querySelector('.collapse-button');
        const windowContent = windowElement.querySelector('.window-content');

        // Event listeners for the window buttons
        closeButton.addEventListener('click', () => {
            //close the window
            closeWindow(windowElement);
            //save the state of the windows
            saveState();
        });
        extendButton.addEventListener('click', () => {
            //toggle the window between extended and normal state
            toggleExtendWindow(windowElement, windowState, windowContent);
            //save the state of the windows
            saveState();
        });
        collapseButton.addEventListener('click', () => {
            //toggle the window between collapsed and normal state
            toggleCollapseWindow(windowElement, windowState, windowContent);
            //save the state of the windows
            saveState();
        });
        // Event listener to prevent the window from being dragged when the content is clicked
        makeWindowDraggable(windowElement);

        // Event listener to bring the window to the front when clicked
        windowElement.addEventListener('mousedown', () => {
            updateZIndex(allWindows, windowElement);
        
            // Log the new z-index values for debugging
            // Assign unique IDs to window elements if not already assigned
        allWindows.forEach((winState, index) => {
                console.log(`Window: ${index + 1 || ''} zIndex: ${winState.windowElement.style.zIndex}`);
            });
        });


        const updateZIndex = (allWindows, windowElement) => {
            // Get the length of allWindows
            const numWindows = allWindows.length;
        
            // Calculate and assign ordered zIndexes from 1 to numWindows to all windows apart from the clicked one
            let zIndex = 1;
            // Assign zIndex values to all windows apart from the clicked one
            allWindows.forEach(winState => {
                // Skip the clicked window
                if (winState.windowElement !== windowElement) {
                    // Assign zIndex values from 1 to numWindows
                    winState.windowElement.style.zIndex = zIndex;
                    zIndex++;
                }
            });
        
            // Assign the highest zIndex to the clicked window
            windowElement.style.zIndex = numWindows;
        };

    };

    //function to close the window
    const closeWindow = (windowElement) => {
        //remove the window element from the DOM
        windowElement.remove();
        //remove the window from the allWindows array
        allWindows = allWindows.filter(win => win.windowElement !== windowElement);
    };

    //function to toggle the window between extended and normal state
    const toggleExtendWindow = (windowElement, windowState, windowContent) => {
        //if window is maximized, restore to normal state when extend button is clicked
        if (windowState.state === 'maximized') {
            restoreToNormal(windowElement, windowState);
        } 
        //if window is collapsed, restore to normal state when extend button is clicked
        else if (windowState.state === 'collapsed') {
            restoreToNormal(windowElement, windowState);
        } 
        //if window is normal, extend to maximized state when extend button is clicked
        else {
            extendWindow(windowElement, windowState);
        }
        //save the state of the windows
        saveState();
    };


    const restoreToNormal = (windowElement, windowState) => {
        windowElement.style.width = windowState.initialPosition.width;
        windowElement.style.height = windowState.initialPosition.height;
        windowElement.style.left = windowState.initialPosition.left;
        windowElement.style.top = windowState.initialPosition.top;
        windowElement.style.position = 'absolute';
        windowState.state = 'normal';

        // Restore content usability and re-enable functionalities
        const windowContent = windowElement.querySelector('.window-content');
        windowContent.classList.remove('hidden');
        windowContent.style.pointerEvents = 'auto';

        makeWindowDraggable(windowElement);
        makeWindowResizable(windowElement);
        makeWindowBordersResizable(windowElement);
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
        // Disable window draggable and resizable functionalities when window is extended
        disableWindowDraggable(windowElement);
        disableWindowResizable(windowElement);
        const windowContent = windowElement.querySelector('.window-content');
        windowContent.style.pointerEvents = 'none';
        saveState();
    };

    //function to disable the window from being dragged 
    const disableWindowDraggable = (windowElement) => {
        const header = windowElement.querySelector('.window-header');
        header.style.cursor = 'default';
        header.onmousedown = null;
    };

    //function to disable the window from being resized
    const disableWindowResizable = (windowElement) => {
        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        resizers.forEach(resizer => {
            resizer.style.display = 'none';
        });
    };

    //function to click collapsed window
    const toggleCollapseWindow = (windowElement, windowState, windowContent) => {
        //if window is collapsed, restore to normal state when collapse button is clicked
        if (windowState.state === 'collapsed') {
            restoreCollapsedWindow(windowElement, windowState, windowContent);
        } 
        //if window is maximised or normal, collapse to collapsed state when collapse button is clicked
        else {
            collapseWindow(windowElement, windowState, windowContent);
            //window is draggable when collapsed
            makeWindowDraggable(windowElement);
            //window is not resizable when collapsed
            disableWindowResizable(windowElement);
        }
        saveState();
    };

    //function to restore the window to normal state from collapsed state, making it draggable and resizable again
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
        saveState();
    };

    //collapsed window size and positioning
    const collapseWindow = (windowElement, windowState, windowContent) => {
        //save the initial position of the window
        windowState.initialPosition = {
            //save the width, height, left and top of the window
            width: windowElement.style.width,
            height: windowElement.style.height,
            left: windowElement.style.left,
            top: windowElement.style.top
        };
        //set the width and height of the window to 220px and 60px respectively
        windowElement.style.width = '220px';
        windowElement.style.height = '60px';
        windowContent.classList.add('hidden');
        windowState.state = 'collapsed';
        windowContent.style.pointerEvents = 'none';

        // Ensure window is draggable
        makeWindowDraggable(windowElement);
        saveState();
    };


    const makeWindowDraggable = (windowElement) => {
        let isDragging = false, startX, startY, startLeft, startTop;

        const onMouseDown = (event) => {
            if (event.target.closest('.window-header')) {
                isDragging = true;
                // Get the initial position of the mouse
                startX = event.clientX;
                startY = event.clientY;

                // Get the initial position of the window
                startLeft = parseInt(windowElement.style.left || 0, 10);
                startTop = parseInt(windowElement.style.top || 0, 10);

                // Add noselect class to prevent text selection
                document.body.classList.add('noselect');

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                event.preventDefault(); // Prevent default actions
            }
        };

        const onMouseMove = (event) => {
            if (isDragging) {
                // Calculate the distance moved by the mouse
                const dx = event.clientX - startX;
                const dy = event.clientY - startY;

                // Calculate the new position of the window
                let newLeft = startLeft + dx;
                let newTop = startTop + dy;

                // Ensure the window stays within horizontal bounds
                newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - windowElement.offsetWidth));

                // Ensure the window stays within vertical bounds
                newTop = Math.max(0, Math.min(newTop, window.innerHeight - windowElement.offsetHeight));

                // Update the position of the window
                windowElement.style.left = `${newLeft}px`;
                windowElement.style.top = `${newTop}px`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            document.body.classList.remove('noselect'); // Remove noselect class
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            saveState();
        };

        // Add event listener to the window header
        const header = windowElement.querySelector('.window-header');
        header.onmousedown = onMouseDown;
        header.style.cursor = 'move';  // Change cursor to indicate draggable
    };

    const makeWindowResizable = (windowElement) => {
        // Get all resizer elements
        const resizers = windowElement.querySelectorAll('.resizer');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop, resizer;
        const minWidth = 220;
        const minHeight = 100;
    
        const onMouseDown = (event) => {
            event.preventDefault(); // Prevent default actions
            event.stopPropagation(); // Prevent other mousedown handlers from executing
    
            if (windowElement.style.position === 'fixed') return;
            isResizing = true;
            startX = event.clientX;
            startY = event.clientY;
            startWidth = parseInt(windowElement.style.width, 10);
            startHeight = parseInt(windowElement.style.height, 10);
            startLeft = parseInt(windowElement.style.left, 10);
            startTop = parseInt(windowElement.style.top, 10);
            //Get the closest resizer element to the click
            resizer = event.target.closest('.resizer');
            
            // Add noselect class to prevent text selection
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
    
        // Bind event listeners to corner resizers
        resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', onMouseDown);
        });
    };

    const makeWindowBordersResizable = (windowElement) => {
        const borderResizers = windowElement.querySelectorAll('.border-resizer');
        let isResizing = false;
        // Initialize variables to store the initial position of the mouse and window
        let startX, startY, startWidth, startHeight, startLeft, startTop, borderResizer;
        const minWidth = 220;
        const minHeight = 100;

        const onMouseDown = (event) => {
            isResizing = true;
            // Get the initial position of the mouse
            startX = event.clientX;
            startY = event.clientY;

            // Get the initial position of the window
            startWidth = parseInt(windowElement.style.width, 10);
            startHeight = parseInt(windowElement.style.height, 10);
            startLeft = parseInt(windowElement.style.left, 10);
            startTop = parseInt(windowElement.style.top, 10);

            // Get the resizer element
            borderResizer = event.target;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            event.preventDefault(); // Prevent default actions
        };

        const onMouseMove = (event) => {
            if (!isResizing) return;
            // Calculate the distance moved by the mouse
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            // Calculate the new position of the window
            let newWidth, newHeight, newLeft, newTop;

            // Determine the resizer being dragged and update the window size accordingly
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
            document.body.classList.remove('noselect'); // Remove noselect class
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            saveState();
        };

        borderResizers.forEach(borderResizer => {
            borderResizer.style.display = 'block';  // Ensure visibility of resizers
            borderResizer.onmousedown = onMouseDown;
        });
    };

    // Automatically load and restore the state on document load
    window.addEventListener('load', () => {
        //load the saved state of the windows
        const savedState = loadState();
        if (savedState.length > 0) {
            createWindows(savedState.length); // Restore saved state
        } else {
            createWindows(1); // Default to 1 window if no saved state is found
        }
    });
});
