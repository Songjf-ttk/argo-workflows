import * as kubernetes from 'argo-ui/src/models/kubernetes';
import * as React from 'react';
import {CronWorkflowSpec, CronWorkflowStatus} from '../../../models';
import {Timestamp} from '../../shared/components/timestamp';
import {ConditionsPanel} from '../../shared/conditions-panel';
import {WorkflowLink} from '../../workflows/components/workflow-link';
import {PrettySchedule} from './pretty-schedule';

export function CronWorkflowStatusViewer({spec, status}: {spec: CronWorkflowSpec; status: CronWorkflowStatus}) {
    if (status === null) {
        return null;
    }
    return (
        <div className='white-box'>
            <div className='white-box__details'>
                {[
                    {title: '活跃的', value: status.active ? getCronWorkflowActiveWorkflowList(status.active) : <i>没有进行中的工作流</i>},
                    {
                        title: '规划',
                        value: (
                            <>
                                <code>{spec.schedule}</code> <PrettySchedule schedule={spec.schedule} />
                            </>
                        )
                    },
                    {title: '上次规划时间', value: <Timestamp date={status.lastScheduledTime} />},
                    {title: '状况', value: <ConditionsPanel conditions={status.conditions} />}
                ].map(attr => (
                    <div className='row white-box__details-row' key={attr.title}>
                        <div className='columns small-3'>{attr.title}</div>
                        <div className='columns small-9'>{attr.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getCronWorkflowActiveWorkflowList(active: kubernetes.ObjectReference[]) {
    return active.reverse().map(activeWf => <WorkflowLink key={activeWf.uid} namespace={activeWf.namespace} name={activeWf.name} />);
}
