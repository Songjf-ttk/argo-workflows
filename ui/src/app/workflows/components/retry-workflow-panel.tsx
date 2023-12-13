import {Checkbox} from 'argo-ui';
import React, {useState} from 'react';
import {Parameter, RetryOpts, Workflow} from '../../../models';
import {uiUrl} from '../../shared/base';
import {ErrorNotice} from '../../shared/components/error-notice';
import {ParametersInput} from '../../shared/components/parameters-input/parameters-input';
import {services} from '../../shared/services';
import {Utils} from '../../shared/utils';

interface Props {
    workflow: Workflow;
    isArchived: boolean;
    isWorkflowInCluster: boolean;
}

export function RetryWorkflowPanel(props: Props) {
    const [overrideParameters, setOverrideParameters] = useState(false);
    const [restartSuccessful, setRestartSuccessful] = useState(false);
    const [workflowParameters, setWorkflowParameters] = useState<Parameter[]>(JSON.parse(JSON.stringify(props.workflow.spec.arguments.parameters || [])));
    const [nodeFieldSelector, setNodeFieldSelector] = useState('');
    const [error, setError] = useState<Error>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submit() {
        setIsSubmitting(true);
        const parameters: RetryOpts['parameters'] = overrideParameters
            ? [...workflowParameters.filter(p => Utils.getValueFromParameter(p) !== undefined).map(p => p.name + '=' + Utils.getValueFromParameter(p))]
            : [];
        const opts: RetryOpts = {
            parameters,
            restartSuccessful,
            nodeFieldSelector
        };

        try {
            const submitted =
                props.isArchived && !props.isWorkflowInCluster
                    ? await services.workflows.retryArchived(props.workflow.metadata.uid, props.workflow.metadata.namespace, opts)
                    : await services.workflows.retry(props.workflow.metadata.name, props.workflow.metadata.namespace, opts);
            document.location.href = uiUrl(`workflows/${submitted.metadata.namespace}/${submitted.metadata.name}`);
        } catch (err) {
            setError(err);
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <h4>重试工作流</h4>
            <h5>
                {props.workflow.metadata.namespace}/{props.workflow.metadata.name}
            </h5>

            {error && <ErrorNotice error={error} />}
            <div className='white-box'>
                {/* Override Parameters */}
                <div key='override-parameters' style={{marginBottom: 25}}>
                    <label>覆盖参数</label>
                    <div className='columns small-9'>
                        <Checkbox checked={overrideParameters} onChange={setOverrideParameters} />
                    </div>
                </div>

                {overrideParameters && (
                    <div key='parameters' style={{marginBottom: 25}}>
                        <label>参数</label>
                        {workflowParameters.length > 0 ? (
                            <ParametersInput parameters={workflowParameters} onChange={setWorkflowParameters} />
                        ) : (
                            <>
                                <br />
                                <label>没有参数</label>
                            </>
                        )}
                    </div>
                )}

                {/* Restart Successful */}
                <div key='restart-successful' style={{marginBottom: 25}}>
                    <label>重启成功</label>
                    <div className='columns small-9'>
                        <Checkbox checked={restartSuccessful} onChange={setRestartSuccessful} />
                    </div>
                </div>

                {restartSuccessful && (
                    <div key='node-field-selector' style={{marginBottom: 25}}>
                        <label>
                        节点字段选择器以重新启动节点。
                        </label>

                        <div className='columns small-9'>
                            <textarea className='argo-field' value={nodeFieldSelector} onChange={e => setNodeFieldSelector(e.target.value)} />
                        </div>
                    </div>
                )}

                {/* Retry button */}
                <div key='retry'>
                    <button onClick={submit} className='argo-button argo-button--base' disabled={isSubmitting}>
                        <i className='fa fa-plus' /> {isSubmitting ? 'Loading...' : 'Retry'}
                    </button>
                </div>
            </div>
        </>
    );
}
