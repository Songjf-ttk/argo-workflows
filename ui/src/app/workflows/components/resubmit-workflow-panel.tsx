import {Checkbox} from 'argo-ui';
import React, {useState} from 'react';
import {Parameter, ResubmitOpts, Workflow} from '../../../models';
import {uiUrl} from '../../shared/base';
import {ErrorNotice} from '../../shared/components/error-notice';
import {ParametersInput} from '../../shared/components/parameters-input/parameters-input';
import {services} from '../../shared/services';
import {Utils} from '../../shared/utils';

interface Props {
    workflow: Workflow;
    isArchived: boolean;
}

export function ResubmitWorkflowPanel(props: Props) {
    const [overrideParameters, setOverrideParameters] = useState(false);
    const [workflowParameters, setWorkflowParameters] = useState<Parameter[]>(JSON.parse(JSON.stringify(props.workflow.spec.arguments.parameters || [])));
    const [memoized, setMemoized] = useState(false);
    const [error, setError] = useState<Error>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submit() {
        setIsSubmitting(true);
        const parameters: ResubmitOpts['parameters'] = overrideParameters
            ? [...workflowParameters.filter(p => Utils.getValueFromParameter(p) !== undefined).map(p => p.name + '=' + Utils.getValueFromParameter(p))]
            : [];
        const opts: ResubmitOpts = {
            parameters,
            memoized
        };

        try {
            const submitted = props.isArchived
                ? await services.workflows.resubmitArchived(props.workflow.metadata.uid, props.workflow.metadata.namespace, opts)
                : await services.workflows.resubmit(props.workflow.metadata.name, props.workflow.metadata.namespace, opts);
            document.location.href = uiUrl(`workflows/${submitted.metadata.namespace}/${submitted.metadata.name}`);
        } catch (err) {
            setError(err);
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <h4>重新提交工作流程</h4>
            <h5>
                {props.workflow.metadata.namespace}/{props.workflow.metadata.name}
            </h5>
            {error && <ErrorNotice error={error} />}
            <div className='white-box'>

                {overrideParameters && (
                    <div key='parameters' style={{marginBottom: 25}}>
                        <label>参数</label>
                        {workflowParameters.length > 0 && <ParametersInput parameters={workflowParameters} onChange={setWorkflowParameters} />}
                        {workflowParameters.length === 0 && (
                            <>
                                <br />
                                <label>没有参数</label>
                            </>
                        )}
                    </div>
                )}

                {overrideParameters && memoized && (
                    <div key='warning-override-with-memoized'>
                        <i className='fa fa-exclamation-triangle' style={{color: '#f4c030'}} />
                        覆盖已记忆的已提交工作流上的参数可能会产生意外的结果。
                    </div>
                )}

                <div key='resubmit'>
                    <button onClick={submit} className='argo-button argo-button--base' disabled={isSubmitting}>
                        <i className='fa fa-plus' /> {isSubmitting ? 'Loading...' : 'Resubmit'}
                    </button>
                </div>
            </div>
        </>
    );
}
