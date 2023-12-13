import {NotificationType} from 'argo-ui';
import * as React from 'react';
import {useContext, useMemo} from 'react';

import {isArchivedWorkflow, isWorkflowInCluster, Workflow} from '../../../../models';
import {Context} from '../../../shared/context';
import {services} from '../../../shared/services';
import * as Actions from '../../../shared/workflow-operations-map';
import {WorkflowOperation, WorkflowOperationAction, WorkflowOperationName} from '../../../shared/workflow-operations-map';

import './workflows-toolbar.scss';

interface WorkflowsToolbarProps {
    selectedWorkflows: Map<string, Workflow>;
    disabledActions: Actions.OperationDisabled;
    clearSelection: () => void;
    loadWorkflows: () => void;
}

interface WorkflowsOperation extends WorkflowOperation {
    isDisabled: boolean;
    action: () => Promise<any>;
}

export function WorkflowsToolbar(props: WorkflowsToolbarProps) {
    const {popup, notifications} = useContext(Context);
    const numberSelected = props.selectedWorkflows.size;

    const operations = useMemo<WorkflowsOperation[]>(() => {
        const actions: any = Actions.WorkflowOperationsMap;

        return Object.keys(actions).map((actionName: WorkflowOperationName) => {
            const action = actions[actionName];
            return {
                title: action.title,
                iconClassName: action.iconClassName,
                isDisabled: props.disabledActions[actionName],
                action: async () => {
                    const confirmed = await popup.confirm('Confirm', `你确定想要 ${action.title.toLowerCase()} 所有已经被选择的工作流?`);
                    if (!confirmed) {
                        return;
                    }

                    let deleteArchived = false;
                    if (action.title === 'DELETE') {
                        // check if there are archived workflows to delete
                        for (const entry of props.selectedWorkflows) {
                            if (isArchivedWorkflow(entry[1])) {
                                deleteArchived = await popup.confirm('Confirm', '是否还想从“存档工作流”数据库中删除它们？');
                                break;
                            }
                        }
                    }

                    await performActionOnSelectedWorkflows(action.title, action.action, deleteArchived);

                    props.clearSelection();
                    notifications.show({
                        content: `对所有工作流执行 '${action.title}.' `,
                        type: NotificationType.Success
                    });
                    props.loadWorkflows();
                },
                disabled: () => false
            } as WorkflowsOperation;
        });
    }, [props.selectedWorkflows]);

    async function performActionOnSelectedWorkflows(title: string, action: WorkflowOperationAction, deleteArchived: boolean): Promise<any> {
        const promises: Promise<any>[] = [];
        props.selectedWorkflows.forEach((wf: Workflow) => {
            if (title === 'DELETE') {
                // The ones without archivalStatus label or with 'Archived' labels are the live workflows.
                if (isWorkflowInCluster(wf)) {
                    promises.push(
                        services.workflows.delete(wf.metadata.name, wf.metadata.namespace).catch(reason =>
                            notifications.show({
                                content: `不能在集群中删除工作流 ${wf.metadata.name}: ${reason.toString()}`,
                                type: NotificationType.Error
                            })
                        )
                    );
                }
                if (deleteArchived && isArchivedWorkflow(wf)) {
                    promises.push(
                        services.workflows.deleteArchived(wf.metadata.uid, wf.metadata.namespace).catch(reason =>
                            notifications.show({
                                content: `不能在数据库中删除工作流 ${wf.metadata.name}: ${reason.toString()}`,
                                type: NotificationType.Error
                            })
                        )
                    );
                }
            } else {
                promises.push(
                    action(wf).catch(reason => {
                        notifications.show({
                            content: `不能 ${title} 工作流: ${reason.content.toString()}`,
                            type: NotificationType.Error
                        });
                    })
                );
            }
        });
        return Promise.all(promises);
    }

    return (
        <div className={`workflows-toolbar ${numberSelected === 0 ? 'hidden' : ''}`}>
            <div className='workflows-toolbar__count'>
                {numberSelected === 0 ? 'No' : numberSelected}
                &nbsp;工作流{numberSelected === 1 ? '' : 's'} 已选择
            </div>
            <div className='workflows-toolbar__actions'>
                {operations.map(operation => {
                    return (
                        <button
                            key={operation.title}
                            onClick={operation.action}
                            className={`workflows-toolbar__actions--${operation.title} workflows-toolbar__actions--action`}
                            disabled={numberSelected === 0 || operation.isDisabled}>
                            <i className={operation.iconClassName} />
                            &nbsp;{operation.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
