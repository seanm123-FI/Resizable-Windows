const loadedModules = {};
const modulesPath = 'modules/';

function hideLoader() {
    let loader = document.body.querySelector('.loader');
    if (loader) {
        loader.remove();
        unloadFile(`${modulesPath}loader/loader.css`);
    }
}

function loadFile(src, callback, parentObj = undefined) {
    let fileToLoad;
    let fileType = src.split('.').pop();
    let obj;
    if (src){
        if (fileType === 'js') {
            fileToLoad = document.createElement('script');
            fileToLoad.src = src;
            fileToLoad.type = 'text/javascript';
        } else if (fileType === 'css') {
            fileToLoad = document.createElement('link');
            fileToLoad.rel = 'stylesheet';
            fileToLoad.type = 'text/css';
            fileToLoad.href = src;
        }

        if (callback){
            if (fileType === 'js') {
                fileToLoad.onload = callback;
            } else if (fileType === 'css') {
                callback();
            }
        }

        if (parentObj) {
            obj = parentObj.appendChild(fileToLoad);
        } else {
            obj = document.head.appendChild(fileToLoad);
        }
    }

    return obj;
}

function loadModule(module, callback) {
    loadedModules[module] = {
        style: `${modulesPath}${module}/${module}.css`,
        script: `${modulesPath}${module}/${module}.js`
    };

    loadFile(`${modulesPath}${module}/${module}.css`, ()=>{
        loadedModules[module].object = loadFile(`${modulesPath}${module}/${module}.js`);
    });

    if (callback){
        callback();
    }
}

function showLoader() {
    loadFile(`${modulesPath}loader/loader.css`, () => {
        let loader = document.createElement('span');
        loader.classList.add('loader');
        document.body.appendChild(loader);
    });
}

function unloadFile(src) {
    let fileType = src.split('.').pop();
    let fileToUnload = document.querySelector(fileType === 'css' ? `[href="${src}"]` : `[src="${src}"]`);
    if (fileToUnload) {
        fileToUnload.remove();
    }
}

function unloadModule(module, callback) {
    unloadFile(loadedModules[module].style, ()=>{
        loadedModules[object].remove();
        unloadFile(loadedModules[module].script, ()=>{
            delete loadedModules[module];
        });
    });
}
