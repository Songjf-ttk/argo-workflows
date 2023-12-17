import * as React from 'react';

import {Tabs} from 'argo-ui';
import {WorkflowTemplate} from '../../../models';
import {LabelsAndAnnotationsEditor} from '../../shared/components/editors/labels-and-annotations-editor';
import {MetadataEditor} from '../../shared/components/editors/metadata-editor';
import {WorkflowParametersEditor} from '../../shared/components/editors/workflow-parameters-editor';
import {ObjectEditor} from '../../shared/components/object-editor/object-editor';

export const ClusterWorkflowTemplateEditor = ({
    onChange,
    template,
    onError,
    onTabSelected,
    selectedTabKey
}: {
    template: WorkflowTemplate;
    onChange: (template: WorkflowTemplate) => void;
    onError: (error: Error) => void;
    onTabSelected?: (tab: string) => void;
    selectedTabKey?: string;
}) => {
    return (
        <Tabs
            key='tabs'
            navTransparent={true}
            selectedTabKey={selectedTabKey}
            onTabSelected={onTabSelected}
            tabs={[
                {
                    key: 'manifest',
                    title: '清单',
                    content: <ObjectEditor type='io.argoproj.workflow.v1alpha1.WorkflowTemplate' value={template} onChange={x => onChange({...x})} />
                },
                {
                    key: 'spec',
                    title: '规格',
                    content: <WorkflowParametersEditor value={template.spec} onChange={spec => onChange({...template, spec})} onError={onError} />
                },
                {
                    key: 'metadata',
                    title: '元数据',
                    content: <MetadataEditor value={template.metadata} onChange={metadata => onChange({...template, metadata})} />
                },
                {
                    key: 'workflow-metadata',
                    title: '工作流元数据',
                    content: (
                        <LabelsAndAnnotationsEditor
                            value={template.spec.workflowMetadata}
                            onChange={workflowMetadata => onChange({...template, spec: {...template.spec, workflowMetadata}})}
                        />
                    )
                }
            ]}
        />
    );
};
