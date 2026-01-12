import { WorkerAction } from '@jupytercad/schema';
declare const WorkerHandler: {
    [key in WorkerAction]: (payload: any) => any;
};
export default WorkerHandler;
