import * as React from 'react';
import {useEffect, useState} from 'react';

import {Workflow} from '../../../../models';
import {InlineTable} from '../../../shared/components/inline-table/inline-table';
import {Loading} from '../../../shared/components/loading';
import {ConditionsPanel} from '../../../shared/conditions-panel';
import {formatDuration} from '../../../shared/duration';
import {services} from '../../../shared/services';
import {WorkflowCreatorInfo} from '../workflow-creator-info/workflow-creator-info';
import {WorkflowFrom} from '../workflow-from';
import {WorkflowLabels} from '../workflow-labels/workflow-labels';

import './workflow-drawer.scss';

interface WorkflowDrawerProps {
    name: string;
    namespace: string;
    onChange: (key: string) => void;
}

export function WorkflowDrawer(props: WorkflowDrawerProps) {
    const [wf, setWorkflow] = useState<Workflow>();

    useEffect(() => {
        (async () => {
            const newWf = await services.workflows.get(props.namespace, props.name);
            setWorkflow(newWf);
        })();
    }, [props.namespace, props.name]);

    if (!wf) {
        return <Loading />;
    }

    return (
        <div className='workflow-drawer'>
            {!wf.status || !wf.status.message ? null : (
                <div className='workflow-drawer__section workflow-drawer__message'>
                    <div className='workflow-drawer__title workflow-drawer__message--label'>消息</div>
                    <div className='workflow-drawer__message--content'>{wf.status.message}</div>
                </div>
            )}
            {!wf.status || !wf.status.conditions ? null : (
                <div className='workflow-drawer__section'>
                    <div className='workflow-drawer__title'>条件</div>
                    <div className='workflow-drawer__conditions'>
                        <ConditionsPanel conditions={wf.status.conditions} />
                    </div>
                </div>
            )}
            {!wf.status || !wf.status.resourcesDuration ? null : (
                <div className='workflow-drawer__section'>
                    <div>
                        <InlineTable
                            rows={[
                                {
                                    left: (
                                        <div className='workflow-drawer__title'>
                                            资源持续时间&nbsp;
                                            <a
                                                href='https://github.com/argoproj/argo-workflows/blob/master/docs/resource-duration.md'
                                                onClick={e => e.stopPropagation()}
                                                target='_blank'
                                                rel='noreferrer'>
                                                <i className='fas fa-info-circle' />
                                            </a>
                                        </div>
                                    ),
                                    right: (
                                        <div>
                                            <div>
                                                <span className='workflow-drawer__resourcesDuration--value'>{formatDuration(wf.status.resourcesDuration.cpu, 1)}</span>
                                                <span>(*1 CPU)</span>
                                            </div>
                                            <div>
                                                <span className='workflow-drawer__resourcesDuration--value'>{formatDuration(wf.status.resourcesDuration.memory, 1)}</span>
                                                <span>(*100Mi Memory)</span>
                                            </div>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </div>
                </div>
            )}
            <div className='workflow-drawer__section'>
                <div className='workflow-drawer__title'>来自</div>
                <div className='workflow-drawer__workflowFrom'>
                    <WorkflowFrom namespace={wf.metadata.namespace || 'default'} labels={wf.metadata.labels || {}} />
                </div>
            </div>
            <div className='workflow-drawer__section workflow-drawer__labels'>
                <div className='workflow-drawer__title'>标签</div>
                <div className='workflow-drawer__labels--list'>
                    <WorkflowLabels
                        workflow={wf}
                        onChange={key => {
                            props.onChange(key);
                        }}
                    />
                </div>
            </div>
            <div className='workflow-drawer__section workflow-drawer__labels'>
                <div className='workflow-drawer__title'>创建者</div>
                <div className='workflow-drawer__labels--list'>
                    <WorkflowCreatorInfo
                        workflow={wf}
                        onChange={key => {
                            props.onChange(key);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
