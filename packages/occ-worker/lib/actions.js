import { JCadWorkerSupportedFormat, WorkerAction } from '@jupytercad/schema';
import { getShapesFactory, ObjectFile } from './occapi';
import { OccParser } from './occparser';
function buildModel(model) {
    const outputModel = [];
    const { objects } = model;
    objects.forEach(object => {
        var _a, _b, _c, _d;
        const { shape, parameters, shapeMetadata } = object;
        if (!shape || !parameters) {
            return;
        }
        const shapeFactory = getShapesFactory();
        let shapeData = undefined;
        if (shapeFactory[shape]) {
            shapeData = (_a = shapeFactory[shape]) === null || _a === void 0 ? void 0 : _a.call(shapeFactory, parameters, model);
        }
        else if (parameters['Shape']) {
            // Creating occ shape from brep file.
            const type = (_b = parameters['Type']) !== null && _b !== void 0 ? _b : 'brep';
            shapeData = ObjectFile({
                content: parameters['Shape'],
                type,
                placement: parameters === null || parameters === void 0 ? void 0 : parameters.Placement
            }, model);
        }
        else if (shape.startsWith('Post::') && shapeMetadata) {
            const shapeFormat = ((_c = shapeMetadata.shapeFormat) !== null && _c !== void 0 ? _c : JCadWorkerSupportedFormat.BREP);
            switch (shapeFormat) {
                case JCadWorkerSupportedFormat.GLTF: {
                    shapeData = {
                        postShape: ''
                    };
                    break;
                }
                case JCadWorkerSupportedFormat.BREP:
                case JCadWorkerSupportedFormat.STL: {
                    shapeData = (_d = shapeFactory['Post::Operator']) === null || _d === void 0 ? void 0 : _d.call(shapeFactory, parameters, model);
                    break;
                }
                default:
                    break;
            }
        }
        if (shapeData) {
            outputModel.push({ shapeData, jcObject: object });
        }
    });
    return outputModel;
}
function loadFile(payload, raiseOnFailure = false) {
    const { content } = payload;
    const outputModel = buildModel(content);
    const parser = new OccParser(outputModel);
    const result = parser.execute(raiseOnFailure);
    const postResult = {};
    outputModel.forEach(item => {
        var _a;
        if ((_a = item.jcObject.shape) === null || _a === void 0 ? void 0 : _a.startsWith('Post::')) {
            postResult[item.jcObject.name] = {
                jcObject: item.jcObject,
                postShape: item.shapeData.postShape
            };
        }
    });
    return { result, postResult };
}
function dryRun(payload) {
    return loadFile(payload, true);
}
const WorkerHandler = {};
WorkerHandler[WorkerAction.LOAD_FILE] = loadFile;
WorkerHandler[WorkerAction.DRY_RUN] = dryRun;
export default WorkerHandler;
