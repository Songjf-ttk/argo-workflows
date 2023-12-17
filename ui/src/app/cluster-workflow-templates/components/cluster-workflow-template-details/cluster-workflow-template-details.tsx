import {NotificationType, Page} from 'argo-ui';
import {SlidingPanel} from 'argo-ui/src/index';
import * as React from 'react';
import {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {ClusterWorkflowTemplate} from '../../../../models';
import {uiUrl} from '../../../shared/base';
import {ErrorNotice} from '../../../shared/components/error-notice';
import {Loading} from '../../../shared/components/loading';
import {useCollectEvent} from '../../../shared/components/use-collect-event';
import {Context} from '../../../shared/context';
import {historyUrl} from '../../../shared/history';
import {services} from '../../../shared/services';
import {useQueryParams} from '../../../shared/use-query-params';
import {Utils} from '../../../shared/utils';
import {SubmitWorkflowPanel} from '../../../workflows/components/submit-workflow-panel';
import {ClusterWorkflowTemplateEditor} from '../cluster-workflow-template-editor';

import '../../../workflows/components/workflow-details/workflow-details.scss';

export function ClusterWorkflowTemplateDetails({history, location, match}: RouteComponentProps<any>) {
    // boiler-plate
    const {navigation, notifications, popup} = useContext(Context);
    const queryParams = new URLSearchParams(location.search);

    const name = match.params.name;
    const [namespace, setNamespace] = useState<string>();
    const [sidePanel, setSidePanel] = useState(queryParams.get('sidePanel') === 'true');
    const [tab, setTab] = useState<string>(queryParams.get('tab'));

    const [error, setError] = useState<Error>();
    const [template, setTemplate] = useState<ClusterWorkflowTemplate>();
    const [edited, setEdited] = useState(false);

    useEffect(
        useQueryParams(history, p => {
            setSidePanel(p.get('sidePanel') === 'true');
            setTab(p.get('tab'));
        }),
        [history]
    );

    useEffect(() => setEdited(true), [template]);
    useEffect(() => {
        history.push(historyUrl('cluster-workflow-templates/{name}', {name, sidePanel, tab}));
    }, [name, sidePanel, tab]);

    useEffect(() => {
        (async () => {
            try {
                const newTemplate = await services.clusterWorkflowTemplate.get(name);
                setTemplate(newTemplate);
                setEdited(false); // set back to false
                setError(null);
            } catch (err) {
                setError(err);
            }
        })();
    }, [name]);

    useEffect(() => {
        (async () => {
            try {
                const info = await services.info.getInfo();
                setNamespace(Utils.getNamespaceWithDefault(info.managedNamespace));
                setError(null);
            } catch (err) {
                setError(err);
            }
        })();
    }, []);

    useCollectEvent('openedClusterWorkflowTemplateDetails');

    return (
        <Page
            title='Cluster Workflow Template Details'
            toolbar={{
                breadcrumbs: [
                    {title: '集群工作流模板', path: uiUrl('cluster-workflow-templates')},
                    {title: name, path: uiUrl('cluster-workflow-templates/' + name)}
                ],
                actionMenu: {
                    items: [
                        {
                            title: '提交',
                            iconClassName: 'fa fa-plus',
                            disabled: edited,
                            action: () => setSidePanel(true)
                        },
                        {
                            title: '更新',
                            iconClassName: 'fa fa-save',
                            disabled: !edited,
                            action: () => {
                                services.clusterWorkflowTemplate
                                    .update(template, name)
                                    .then(setTemplate)
                                    .then(() =>
                                        notifications.show({
                                            content: '已更新',
                                            type: NotificationType.Success
                                        })
                                    )
                                    .then(() => setError(null))
                                    .then(() => setEdited(false))
                                    .catch(setError);
                            }
                        },
                        {
                            title: '删除',
                            iconClassName: 'fa fa-trash',
                            action: () => {
                                popup.confirm('确认', '你确定要删除这个集群工作流模板吗？').then(yes => {
                                    if (yes) {
                                        services.clusterWorkflowTemplate
                                            .delete(name)
                                            .then(() => navigation.goto(uiUrl('cluster-workflow-templates')))
                                            .then(() => setError(null))
                                            .catch(setError);
                                    }
                                });
                            }
                        }
                    ]
                }
            }}>
            <>
                <ErrorNotice error={error} />
                {!template ? (
                    <Loading />
                ) : (
                    <ClusterWorkflowTemplateEditor template={template} onChange={setTemplate} onError={setError} onTabSelected={setTab} selectedTabKey={tab} />
                )}
            </>
            {template && (
                <SlidingPanel isShown={!!sidePanel} onClose={() => setSidePanel(null)} isMiddle={true}>
                    <SubmitWorkflowPanel
                        kind='ClusterWorkflowTemplate'
                        namespace={namespace}
                        name={template.metadata.name}
                        entrypoint={template.spec.entrypoint}
                        templates={template.spec.templates || []}
                        workflowParameters={template.spec.arguments.parameters || []}
                    />
                </SlidingPanel>
            )}
        </Page>
    );
}
