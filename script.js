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
        windowElement.style.left = '400px';
        windowElement.style.top = '200px';
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
        extendButton.addEventListener('click', () => toggleExtendWindow(windowElement, windowState));
        collapseButton.addEventListener('click', () => toggleCollapseWindow(windowElement, windowContent, windowState));

        makeWindowDraggable(windowElement);

        windowElement.addEventListener('mousedown', () => {
            windowElement.style.zIndex = zIndexCounter++;
        });
    }

    function closeWindow(windowElement) {
        windowElement.remove();
        allWindows = allWindows.filter(win => win.windowElement !== windowElement);
    }

    function toggleExtendWindow(windowElement, windowState) {
        if (windowState.state === 'maximized') {
            restoreWindow(windowElement, windowState);
        } else {
            extendWindow(windowElement, windowState);
        }
    }

    function restoreWindow(windowElement, windowState) {
        windowElement.style.width = windowState.initialPosition.width;
        windowElement.style.height = windowState.initialPosition.height;
        windowElement.style.left = windowState.initialPosition.left;
        windowElement.style.top = windowState.initialPosition.top;
        windowElement.style.position = 'absolute';
        windowState.state = 'normal';

        // Restore content usability
        const windowContent = windowElement.querySelector('.window-content');
        windowContent.classList.remove('hidden');
        windowContent.style.pointerEvents = 'auto';

        // Re-enable functionalities
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

    // Disable dragging of the window by setting the header cursor and removing the mousedown event listener.
    function disableWindowDraggable(windowElement) {
        const header = windowElement.querySelector('.window-header');
        header.style.cursor = 'default';
        header.onmousedown = null;
    }

    // Disable resizing functionality by hiding the resizers.
    function disableWindowResizable(windowElement) {
        const resizers = windowElement.querySelectorAll('.resizer, .border-resizer');
        resizers.forEach(resizer => {
            resizer.style.display = 'none';
        });
    }

    function toggleCollapseWindow(windowElement, windowContent, windowState) {
        windowState.state === 'collapsed' ? restoreCollapsedWindow(windowElement, windowContent, windowState) : collapseWindow(windowElement, windowContent, windowState);

        // Disable content usability when minimized
        windowContent.style.pointerEvents = windowState.state === 'collapsed' ? 'none' : 'auto';
    }

    function restoreCollapsedWindow(windowElement, windowContent, windowState) {
        windowContent.classList.remove('hidden');
        windowElement.style.width = windowState.initialPosition.width;
        windowElement.style.height = windowState.initialPosition.height;
        windowState.state = 'normal';
        makeWindowDraggable(windowElement);
        makeWindowResizable(windowElement);
    }

    function collapseWindow(windowElement, windowContent, windowState) {
        windowState.initialPosition.width = windowElement.style.width;
        windowState.initialPosition.height = windowElement.style.height;
        windowElement.style.width = '220px';
        windowElement.style.height = '60px';
        windowContent.classList.add('hidden');
        windowState.state = 'collapsed';
        windowContent.style.pointerEvents = 'none';
        disableWindowResizable(windowElement);
    }

    function makeWindowDraggable(windowElement) {
        let isDragging = false, startX, startY, startLeft, startTop;

        const onMouseDown = (event) => {
            if (event.target.closest('.window-header') && windowElement.style.position !== 'fixed') {
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
                windowElement.style.left = `${startLeft + dx}px`;
                windowElement.style.top = `${startTop + dy}px`;
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

            switch (resizer.className.baseVal) {
                case 'resizer top-left':
                    const newWidthTopLeft = startWidth - dx;
                    const newHeightTopLeft = startHeight - dy;

                    if (newWidthTopLeft > minWidth) {
                        windowElement.style.width = `${newWidthTopLeft}px`;
                        windowElement.style.left = `${startLeft + dx}px`;
                    }

                    if (newHeightTopLeft > minHeight) {
                        windowElement.style.height = `${newHeightTopLeft}px`;
                        windowElement.style.top = `${startTop + dy}px`;
                    }

                    break;

                case 'resizer top-right':
                    const newWidthTopRight = startWidth + dx;
                    const newHeightTopRight = startHeight - dy;

                    if (newWidthTopRight > minWidth) {
                        windowElement.style.width = `${newWidthTopRight}px`;
                    }

                    if (newHeightTopRight > minHeight) {
                        windowElement.style.height = `${newHeightTopRight}px`;
                        windowElement.style.top = `${startTop + dy}px`;
                    }

                    break;

                case 'resizer bottom-left':
                    const newWidthBottomLeft = startWidth - dx;
                    const newHeightBottomLeft = startHeight + dy;

                    if (newWidthBottomLeft > minWidth) {
                        windowElement.style.width = `${newWidthBottomLeft}px`;
                        windowElement.style.left = `${startLeft + dx}px`;
                    }

                    if (newHeightBottomLeft > minHeight) {
                        windowElement.style.height = `${newHeightBottomLeft}px`;
                    }

                    break;

                case 'resizer bottom-right':
                    const newWidthBottomRight = startWidth + dx;
                    const newHeightBottomRight = startHeight + dy;

                    if (newWidthBottomRight > minWidth) {
                        windowElement.style.width = `${newWidthBottomRight}px`;
                    }
                    if (newHeightBottomRight > minHeight) {
                        windowElement.style.height = `${newHeightBottomRight}px`;
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

            switch (borderResizer.classList[1]) {
                case 'top':
                    const newHeightTop = startHeight - dy;
                    if (newHeightTop > minHeight) {
                        windowElement.style.height = `${newHeightTop}px`;
                        windowElement.style.top = `${startTop + dy}px`;
                    }
                    break;

                case 'bottom':
                    const newHeightBottom = startHeight + dy;
                    if (newHeightBottom > minHeight) {
                        windowElement.style.height = `${newHeightBottom}px`;
                    }
                    break;

                case 'left':
                    const newWidthLeft = startWidth - dx;
                    if (newWidthLeft > minWidth) {
                        windowElement.style.width = `${newWidthLeft}px`;
                        windowElement.style.left = `${startLeft + dx}px`;
                    }
                    break;

                case 'right':
                    const newWidthRight = startWidth + dx;
                    if (newWidthRight > minWidth) {
                        windowElement.style.width = `${newWidthRight}px`;
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
