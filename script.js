document.addEventListener('DOMContentLoaded', () => {
    const createWindowButton = document.getElementById('createWindowButton');
    const windowTemplate = document.getElementById('window-template');

    createWindowButton.addEventListener('click', createWindow);

    function createWindow() {
        const windowElement = createWindowElement();
        document.body.appendChild(windowElement);
        addWindowEventListeners(windowElement);
    }

    function createWindowElement() {
       
        const windowElement = document.importNode(windowTemplate.content, true).querySelector('.window');
        windowElement.style.position = 'absolute';
        windowElement.style.left = '150px';
        windowElement.style.top = '270px';
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
});
