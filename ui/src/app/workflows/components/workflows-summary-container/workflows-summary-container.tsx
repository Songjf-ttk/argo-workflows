import {Tooltip} from 'argo-ui';
import * as React from 'react';
import {useEffect, useState} from 'react';

import {Workflow} from '../../../../models';

import './workflows-summary-container.scss';

type ReduceReturnType = Record<string, number>;

export function WorkflowsSummaryContainer(props: {workflows: Workflow[]}) {
    const [wfSummary, setWfSummary] = useState(null);
    useEffect(() => {
        if (props.workflows) {
            const summary = props.workflows.reduce<ReduceReturnType>((acc, curr) => {
                return {...acc, [curr.status.phase]: acc[curr.status.phase] ? ++acc[curr.status.phase] : 1};
            }, {});
            setWfSummary(summary);
        }
    }, [props.workflows]);

    return (
        <div className='wf-summary-container'>
            <p className='wf-summary-container__title'>
            工作流概览{' '}
                <Tooltip content='Only workflows in view are summarized'>
                    <i className='fa fa-info-circle' />
                </Tooltip>
            </p>
            <div className='row'>
                <div className='columns small-12 xlarge-12'>
                    <span className='wf-summary-container__text'>运行中的工作流 &nbsp;</span>
                    <span className='wf-summary-container__running'>{wfSummary && wfSummary.Running ? wfSummary.Running : 0}</span>
                </div>
            </div>
            <div className='row'>
                <div className='columns small-12 xlarge-6'>
                    <span className='wf-summary-container__subtext'>待定 &nbsp;</span>
                    <span className='wf-summary-container__others'>{wfSummary && wfSummary.Pending ? wfSummary.Pending : 0}</span>
                </div>
                <div className='columns small-12 xlarge-6'>
                    <span className='wf-summary-container__subtext'>已完成 &nbsp;</span>
                    <span className='wf-summary-container__others'>{wfSummary && wfSummary.Succeeded ? wfSummary.Succeeded : 0}</span>
                </div>
            </div>
            <div className='row'>
                <div className='columns small-12 xlarge-6'>
                    <span className='wf-summary-container__subtext'>失败 &nbsp;</span>
                    <span className='wf-summary-container__others'>{wfSummary && wfSummary.Failed ? wfSummary.Failed : 0}</span>
                </div>
                <div className='columns small-12 xlarge-6'>
                    <span className='wf-summary-container__subtext'>报错 &nbsp;</span>
                    <span className='wf-summary-container__others'>{wfSummary && wfSummary.Error ? wfSummary.Error : 0}</span>
                </div>
            </div>
        </div>
    );
}
