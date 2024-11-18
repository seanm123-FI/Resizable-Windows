document.addEventListener('DOMContentLoaded', () => {
    const createWindowButton = document.getElementById('createWindowButton');
    const windowTemplate = document.getElementById('window-template');

    createWindowButton.addEventListener('click', createWindow);

    function createWindow() {
        const windowElement = createWindowElement();
        document.body.appendChild(windowElement);
        addWindowEventListeners(windowElement);
        makeWindowResizable(windowElement);
    }

    function createWindowElement() {
       
        const windowElement = document.importNode(windowTemplate.content, true).querySelector('.window');
        windowElement.style.position = 'absolute';
        windowElement.style.left = '700px';
        windowElement.style.top = '300px';
        windowElement.style.width = '400px';  // Default width
        windowElement.style.height = '300px'; // Default height
        return windowElement;

    }

    function addWindowEventListeners(windowElement) {
        const closeButton = windowElement.querySelector('.close-button');
        const extendButton = windowElement.querySelector('.extend-button');
        const collapseButton = windowElement.querySelector('.collapse-button');
        const windowContent = windowElement.querySelector('.window-content');

        // Save initial size and position
        const initialState = {
            width: windowElement.style.width,
            height: windowElement.style.height,
            left: windowElement.style.left,
            top: windowElement.style.top
        };

        // Add button event listeners
        closeButton.addEventListener('click', () => closeWindow(windowElement));
        extendButton.addEventListener('click', () => toggleExtendWindow(windowElement, initialState));
        collapseButton.addEventListener('click', () => toggleCollapseWindow(windowElement, windowContent, initialState));

        // Make the window draggable
        makeWindowDraggable(windowElement);
    }

    function closeWindow(windowElement) {
        windowElement.remove();
    }

    function toggleExtendWindow(windowElement, initialState) {
        if (windowElement.style.width === '100%' && windowElement.style.height === '100%') {
            restoreWindow(windowElement, initialState);
        } else {
            extendWindow(windowElement, initialState);
        }
    }

    function restoreWindow(windowElement, initialState) {
        windowElement.style.width = initialState.width;
        windowElement.style.height = initialState.height;
        windowElement.style.left = initialState.left;
        windowElement.style.top = initialState.top;
        windowElement.style.position = 'absolute';
    }

    function extendWindow(windowElement, initialState) {
        initialState.width = windowElement.style.width;
        initialState.height = windowElement.style.height;
        initialState.left = windowElement.style.left;
        initialState.top = windowElement.style.top;
        windowElement.style.width = '100%';
        windowElement.style.height = '100%';
        windowElement.style.left = '0';
        windowElement.style.top = '0';
        windowElement.style.position = 'fixed';
    }

    function toggleCollapseWindow(windowElement, windowContent, initialState) {
        if (windowContent.classList.contains('hidden')) {
            restoreCollapsedWindow(windowElement, windowContent, initialState);
        } else {
            collapseWindow(windowElement, windowContent, initialState);
        }
    }

    function restoreCollapsedWindow(windowElement, windowContent, initialState) {
        windowContent.classList.remove('hidden');
        windowElement.style.width = initialState.width;
        windowElement.style.height = initialState.height;
    }

    function collapseWindow(windowElement, windowContent, initialState) {
        initialState.width = windowElement.style.width;
        initialState.height = windowElement.style.height;
        windowElement.style.width = '180px';
        windowElement.style.height = '40px';
        windowContent.classList.add('hidden');
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
                windowElement.style.left = `${startLeft + dx}px`;
                windowElement.style.top = `${startTop + dy}px`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        windowElement.querySelector('.window-header').addEventListener('mousedown', onMouseDown);
    }

    function makeWindowResizable(windowElement) {
        const resizers = windowElement.querySelectorAll('.resizer');
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop, resizer;
        const minWidth = 180;
        const minHeight = 40;

        const onMouseDown = (event) => {
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

                    if(newWidthTopRight > minWidth){
                        windowElement.style.width = `${newWidthTopRight}px`;
                    }

                    if(newHeightTopRight > minHeight){
                        windowElement.style.height = `${newHeightTopRight}px`;
                        windowElement.style.top = `${startTop + dy}px`
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
                    if (newHeightBottomRight > minHeight){
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
            resizer.addEventListener('mousedown', onMouseDown);
        });
    }
});