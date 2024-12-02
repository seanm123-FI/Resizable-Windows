let zIndexCounter = 1000; // Initial z-index value
let allWindows = [];

document.addEventListener('DOMContentLoaded', () => {
    const createWindowButton = document.getElementById('createWindowButton');
    const windowTemplate = document.getElementById('window-template');

    createWindowButton.addEventListener('click', createWindow);

    function createWindow() {
        const windowElement = createWindowElement();
        windowElement.style.zIndex = zIndexCounter++;
        document.body.appendChild(windowElement);

        const windowState = {
            windowElement,
            state: 'normal',
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

    function createWindowElement() {
        const windowElement = document.importNode(windowTemplate.content, true).querySelector('.window');
        windowElement.style.position = 'absolute';
        windowElement.style.left = '750px';
        windowElement.style.top = '300px';
        windowElement.style.width = '400px';  // Default width
        windowElement.style.height = '300px'; // Default height
        return windowElement;
    }

    function addWindowEventListeners(windowElement, windowState) {
        const closeButton = windowElement.querySelector('.close-button');
        const extendButton = windowElement.querySelector('.extend-button');
        const collapseButton = windowElement.querySelector('.collapse-button');
        const windowContent = windowElement.querySelector('.window-content');

        closeButton.addEventListener('click', () => closeWindow(windowElement));
        extendButton.addEventListener('click', () => toggleExtendWindow(windowElement, windowState, windowContent));
        collapseButton.addEventListener('click', () => toggleCollapseWindow(windowElement, windowState, windowContent));

        makeWindowDraggable(windowElement);

        windowElement.addEventListener('mousedown', () => {
            windowElement.style.zIndex = zIndexCounter++;
        });
    }

    function closeWindow(windowElement) {
        windowElement.remove();
        allWindows = allWindows.filter(win => win.windowElement !== windowElement);
    }

    function toggleExtendWindow(windowElement, windowState, windowContent) {
        if (windowState.state === 'maximized') {
            restoreToNormal(windowElement, windowState);
        } else if (windowState.state === 'collapsed') {
            restoreToNormal(windowElement, windowState);
        } else {
            extendWindow(windowElement, windowState);
        }
    }

    function restoreToNormal(windowElement, windowState) {
        windowElement.style.width = '400px';  // Default width
        windowElement.style.height = '300px'; // Default height
        windowElement.style.position = 'absolute';
        windowState.state = 'normal';

        // Restore content usability and re-enable functionalities
        const windowContent = windowElement.querySelector('.window-content');
        windowContent.classList.remove('hidden');
        windowContent.style.pointerEvents = 'auto';

        makeWindowDraggable(windowElement);
        makeWindowResizable(windowElement);
        makeWindowBordersResizable(windowElement);
    }

    function extendWindow(windowElement, windowState) {
        windowState.initialPosition.width = windowElement.style.width;
        windowState.initialPosition.height = windowElement.style.height;
        windowState.initialPosition.left = windowElement.style.left;
        windowState.initialPosition.top = windowElement.style.top;
        windowElement.style.width = '99%';
        windowElement.style.height = '99%';
        windowElement.style.left = '0';
        windowElement.style.top = '0';
        windowElement.style.position = 'fixed';
        windowState.state = 'maximized';
        disableWindowDraggable(windowElement);
        disableWindowResizable(windowElement);
        const windowContent = windowElement.querySelector('.window-content');
        windowContent.style.pointerEvents = 'none';
    }

    function disableWindowDraggable(windowElement) {
        const header = windowElement.querySelector('.window-header');
        header.style.cursor = 'default';
        header.onmousedown = null;
    }

    function disableWindowResizable(windowElement) {
        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        resizers.forEach(resizer => {
            resizer.style.display = 'none';
        });
    }

    function toggleCollapseWindow(windowElement, windowState, windowContent) {
        if (windowState.state === 'collapsed') {
            restoreCollapsedWindow(windowElement, windowState, windowContent);
        } else {
            collapseWindow(windowElement, windowState, windowContent);
            makeWindowDraggable(windowElement);
            disableWindowResizable(windowElement);
        }
    }

    function restoreCollapsedWindow(windowElement, windowState, windowContent) {
        windowContent.classList.remove('hidden');
        windowElement.style.width = '400px';  // Default width
        windowElement.style.height = '300px'; // Default height
        windowElement.style.position = 'absolute';
        windowState.state = 'normal';
        makeWindowDraggable(windowElement);
        makeWindowResizable(windowElement);
        makeWindowBordersResizable(windowElement);
    }

    function collapseWindow(windowElement, windowState, windowContent) {
        windowState.initialPosition.width = windowElement.style.width;
        windowState.initialPosition.height = windowElement.style.height;
        windowElement.style.width = '220px';
        windowElement.style.height = '60px';
        windowContent.classList.add('hidden');
        windowState.state = 'collapsed';
        windowContent.style.pointerEvents = 'none';

        // Ensure window is draggable
        makeWindowDraggable(windowElement);
    }

    function makeWindowDraggable(windowElement) {
        let isDragging = false, startX, startY, startLeft, startTop;

        const onMouseDown = (event) => {
            if (event.target.closest('.window-header')) {
                isDragging = true;
                startX = event.clientX;
                startY = event.clientY;
                startLeft = parseInt(windowElement.style.left || 0, 10);
                startTop = parseInt(windowElement.style.top || 0, 10);
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        };

        const onMouseMove = (event) => {
            if (isDragging) {
                const dx = event.clientX - startX;
                const dy = event.clientY - startY;

                let newLeft = startLeft + dx;
                let newTop = startTop + dy;

                // Ensure the window stays within horizontal bounds
                newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - windowElement.offsetWidth));

                // Ensure the window stays within vertical bounds
                newTop = Math.max(0, Math.min(newTop, window.innerHeight - windowElement.offsetHeight));

                windowElement.style.left = `${newLeft}px`;
                windowElement.style.top = `${newTop}px`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        const header = windowElement.querySelector('.window-header');
        header.onmousedown = onMouseDown;
        header.style.cursor = 'move';  // Change cursor to indicate draggable
    }

    function makeWindowResizable(windowElement) {
        const resizers = windowElement.querySelectorAll('.resizer');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop, resizer;
        const minWidth = 220;
        const minHeight = 100;

        const onMouseDown = (event) => {
            if (windowElement.style.position === 'fixed') return;
            isResizing = true;
            startX = event.clientX;
            startY = event.clientY;
            startWidth = parseInt(windowElement.style.width, 10);
            startHeight = parseInt(windowElement.style.height, 10);
            startLeft = parseInt(windowElement.style.left, 10);
            startTop = parseInt(windowElement.style.top, 10);
            resizer = event.target;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (event) => {
            if (!isResizing) return;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            let newWidth, newHeight, newLeft, newTop;

            switch (resizer.className.baseVal) {
                case 'resizer top-left':
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

                case 'resizer top-right':
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

                case 'resizer bottom-left':
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

                case 'resizer bottom-right':
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
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        resizers.forEach(resizer => {
            resizer.style.display = 'block';  // Ensure visibility of resizers
            resizer.onmousedown = onMouseDown;
        });
    }

    function makeWindowBordersResizable(windowElement) {
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
            borderResizer = event.target;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
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
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        borderResizers.forEach(borderResizer => {
            borderResizer.style.display = 'block';  // Ensure visibility of resizers
            borderResizer.onmousedown = onMouseDown;
        });
    }
});
