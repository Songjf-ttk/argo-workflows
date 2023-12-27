import {NodePhase, Workflow} from '../../models';
import {services} from './services';
import {WorkflowDeleteResponse} from './services/responses';
import {Utils} from './utils';

export type OperationDisabled = {
    [action in WorkflowOperationName]: boolean;
};

export type WorkflowOperationName = '重试' | '重新提交' | '恢复' | '删除';

export interface WorkflowOperation {
    title: WorkflowOperationName;
    action: WorkflowOperationAction;
    iconClassName: string;
    disabled: (wf: Workflow) => boolean;
}

export type WorkflowOperationAction = (wf: Workflow) => Promise<Workflow | WorkflowDeleteResponse>;

export interface WorkflowOperations {
    [name: string]: WorkflowOperation;
}

export const WorkflowOperationsMap: WorkflowOperations = {
    RETRY: {
        title: '重试',
        iconClassName: 'fa fa-undo',
        disabled: (wf: Workflow) => {
            const workflowPhase: NodePhase = wf && wf.status ? wf.status.phase : undefined;
            return workflowPhase === undefined || !(workflowPhase === 'Failed' || workflowPhase === 'Error');
        },
        action: (wf: Workflow) => services.workflows.retry(wf.metadata.name, wf.metadata.namespace, null)
    },
    RESUBMIT: {
        title: '重新提交',
        iconClassName: 'fa fa-plus-circle',
        disabled: () => false,
        action: (wf: Workflow) => services.workflows.resubmit(wf.metadata.name, wf.metadata.namespace, null)
    },
    RESUME: {
        title: '恢复',
        iconClassName: 'fa fa-play',
        disabled: (wf: Workflow) => !Utils.isWorkflowSuspended(wf),
        action: (wf: Workflow) => services.workflows.resume(wf.metadata.name, wf.metadata.namespace, null)
    },
    DELETE: {
        title: '删除',
        iconClassName: 'fa fa-trash',
        disabled: () => false,
        action: (wf: Workflow) => services.workflows.delete(wf.metadata.name, wf.metadata.namespace)
    }
};