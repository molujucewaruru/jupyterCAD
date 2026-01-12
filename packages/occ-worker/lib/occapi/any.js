import { _loadObjectFile } from './loadObjectFile';
export function _Any(arg, content) {
    const { Content, Type, Placement } = arg;
    const result = _loadObjectFile({
        content: Content,
        type: Type,
        placement: Placement
    });
    return result;
}
