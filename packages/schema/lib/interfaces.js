/**
 * Action definitions for worker
 */
export var WorkerAction;
(function (WorkerAction) {
    WorkerAction["DRY_RUN"] = "DRY_RUN";
    WorkerAction["LOAD_FILE"] = "LOAD_FILE";
    WorkerAction["SAVE_FILE"] = "SAVE_FILE";
    WorkerAction["REGISTER"] = "REGISTER";
    WorkerAction["POSTPROCESS"] = "POSTPROCESS";
})(WorkerAction || (WorkerAction = {}));
/**
 * Action definitions for main thread
 */
export var MainAction;
(function (MainAction) {
    MainAction["DISPLAY_SHAPE"] = "DISPLAY_SHAPE";
    MainAction["INITIALIZED"] = "INITIALIZED";
    MainAction["DISPLAY_POST"] = "DISPLAY_POST";
    MainAction["DRY_RUN_RESPONSE"] = "DRY_RUN_RESPONSE";
})(MainAction || (MainAction = {}));
export var JCadWorkerSupportedFormat;
(function (JCadWorkerSupportedFormat) {
    JCadWorkerSupportedFormat["BREP"] = "BREP";
    JCadWorkerSupportedFormat["GLTF"] = "GLTF";
    JCadWorkerSupportedFormat["STL"] = "STL";
})(JCadWorkerSupportedFormat || (JCadWorkerSupportedFormat = {}));
