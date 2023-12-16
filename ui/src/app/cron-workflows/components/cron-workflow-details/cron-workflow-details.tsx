import {NotificationType, Page, SlidingPanel} from 'argo-ui';
import * as React from 'react';
import {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import * as models from '../../../../models';
import {CronWorkflow, Link, Workflow} from '../../../../models';
import {uiUrl} from '../../../shared/base';
import {ErrorNotice} from '../../../shared/components/error-notice';
import {openLinkWithKey} from '../../../shared/components/links';
import {Loading} from '../../../shared/components/loading';
import {useCollectEvent} from '../../../shared/components/use-collect-event';
import {ZeroState} from '../../../shared/components/zero-state';
import {Context} from '../../../shared/context';
import {historyUrl} from '../../../shared/history';
import {services} from '../../../shared/services';
import {useQueryParams} from '../../../shared/use-query-params';
import {WidgetGallery} from '../../../widgets/widget-gallery';
import {WorkflowsRow} from '../../../workflows/components/workflows-row/workflows-row';
import {CronWorkflowEditor} from '../cron-workflow-editor';

import '../../../workflows/components/workflow-details/workflow-details.scss';
import './cron-workflow-details.scss';

export function CronWorkflowDetails({match, location, history}: RouteComponentProps<any>) {
    // boiler-plate
    const {navigation, notifications, popup} = useContext(Context);
    const queryParams = new URLSearchParams(location.search);

    const [namespace] = useState(match.params.namespace);
    const [name] = useState(match.params.name);
    const [sidePanel, setSidePanel] = useState(queryParams.get('sidePanel'));
    const [tab, setTab] = useState(queryParams.get('tab'));
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [columns, setColumns] = useState<models.Column[]>([]);

    const [cronWorkflow, setCronWorkflow] = useState<CronWorkflow>();
    const [edited, setEdited] = useState(false);
    const [error, setError] = useState<Error>();

    useEffect(
        useQueryParams(history, p => {
            setSidePanel(p.get('sidePanel'));
            setTab(p.get('tab'));
        }),
        [history]
    );

    useEffect(
        () =>
            history.push(
                historyUrl('cron-workflows/{namespace}/{name}', {
                    namespace,
                    name,
                    sidePanel,
                    tab
                })
            ),
        [namespace, name, sidePanel, tab]
    );

    useEffect(() => {
        services.cronWorkflows
            .get(name, namespace)
            .then(setCronWorkflow)
            .then(() => setEdited(false))
            .then(() => setError(null))
            .catch(setError);
    }, [namespace, name]);

    useEffect(() => setEdited(true), [cronWorkflow]);

    useEffect(() => {
        (async () => {
            const workflowList = await services.workflows.list(namespace, null, [`${models.labels.cronWorkflow}=${name}`], null);
            const workflowsInfo = await services.info.getInfo();

            setWorkflows(workflowList.items);
            setColumns(workflowsInfo.columns);
        })();
    }, []);

    useCollectEvent('openedCronWorkflowDetails');

    const suspendButton =
        cronWorkflow && !cronWorkflow.spec.suspend
            ? {
                  title: '暂停',
                  iconClassName: 'fa fa-pause',
                  action: () =>
                      services.cronWorkflows
                          .suspend(name, namespace)
                          .then(setCronWorkflow)
                          .then(() => setEdited(false))
                          .then(() => setError(null))
                          .catch(setError),
                  disabled: !cronWorkflow || edited
              }
            : {
                  title: '恢复',
                  iconClassName: 'fa fa-play',
                  action: () =>
                      services.cronWorkflows
                          .resume(name, namespace)
                          .then(setCronWorkflow)
                          .then(() => setEdited(false))
                          .then(() => setError(null))
                          .catch(setError),
                  disabled: !cronWorkflow || !cronWorkflow.spec.suspend || edited
              };

    const getItems = () => {
        const items = [
            {
                title: '提交',
                iconClassName: 'fa fa-plus',
                disabled: edited,
                action: () =>
                    services.workflows
                        .submit('cronwf', name, namespace)
                        .then(wf => navigation.goto(uiUrl(`workflows/${wf.metadata.namespace}/${wf.metadata.name}`)))
                        .then(() => setError(null))
                        .catch(setError)
            },
            {
                title: '更新',
                iconClassName: 'fa fa-save',
                disabled: !edited,
                action: () => {
                    // magic - we get the latest from the server and then apply the changes from the rendered version to this
                    return services.cronWorkflows
                        .get(name, namespace)
                        .then(latest =>
                            services.cronWorkflows.update(
                                {
                                    ...latest,
                                    spec: cronWorkflow.spec,
                                    metadata: {...cronWorkflow.metadata, resourceVersion: latest.metadata.resourceVersion}
                                },
                                cronWorkflow.metadata.name,
                                cronWorkflow.metadata.namespace
                            )
                        )
                        .then(setCronWorkflow)
                        .then(() => notifications.show({content: '更新成功', type: NotificationType.Success}))
                        .then(() => setError(null))
                        .then(() => setEdited(false))
                        .catch(setError);
                }
            },
            suspendButton,
            {
                title: '删除',
                iconClassName: 'fa fa-trash',
                disabled: edited,
                action: () => {
                    popup.confirm('确认', '您确定要删除此 cron 工作流吗？').then(yes => {
                        if (yes) {
                            services.cronWorkflows
                                .delete(name, namespace)
                                .then(() => navigation.goto(uiUrl('cron-workflows/' + namespace)))
                                .then(() => setError(null))
                                .catch(setError);
                        }
                    });
                }
            },
            {
                title: '分享',
                iconClassName: 'fa fa-share-alt',
                action: () => setSidePanel('share')
            }
        ];

        if (cronWorkflow?.spec?.workflowSpec?.workflowTemplateRef) {
            const templateName = cronWorkflow.spec.workflowSpec.workflowTemplateRef.name;
            const clusterScope = cronWorkflow.spec.workflowSpec.workflowTemplateRef.clusterScope;
            const url: string = clusterScope ? uiUrl(`cluster-workflow-templates/${templateName}`) : uiUrl(`workflow-templates/${cronWorkflow.metadata.namespace}/${templateName}`);
            const icon: string = clusterScope ? 'fa fa-window-restore' : 'fa fa-window-maximize';

            const templateLink: Link = {
                name: 'Open Workflow Template',
                scope: 'workflow',
                url
            };

            items.push({
                title: templateLink.name,
                iconClassName: icon,
                action: () => openLinkWithKey(templateLink.url)
            });
        }

        return items;
    };

    return (
        <Page
            title='Cron 工作流详细信息'
            toolbar={{
                breadcrumbs: [
                    {title: 'Cron 工作流', path: uiUrl('cron-workflows')},
                    {title: namespace, path: uiUrl('cron-workflows/' + namespace)},
                    {title: name, path: uiUrl('cron-workflows/' + namespace + '/' + name)}
                ],
                actionMenu: {
                    items: getItems()
                }
            }}>
            <>
                <ErrorNotice error={error} />
                {!cronWorkflow ? (
                    <Loading />
                ) : (
                    <CronWorkflowEditor cronWorkflow={cronWorkflow} onChange={setCronWorkflow} onError={setError} selectedTabKey={tab} onTabSelected={setTab} />
                )}
                <SlidingPanel isShown={!!sidePanel} onClose={() => setSidePanel(null)}>
                    {sidePanel === 'share' && <WidgetGallery namespace={namespace} label={'workflows.argoproj.io/cron-workflow=' + name} />}
                </SlidingPanel>
                <>
                    <ErrorNotice error={error} />
                    {!workflows ? (
                        <ZeroState title='没有已完成的cron工作流'>
                            <p> 可以在这里创建新的工作流 </p>
                        </ZeroState>
                    ) : (
                        <div className='argo-table-list workflows-cron-list'>
                            <div className='row argo-table-list__head'>
                                <div className='columns small-1 workflows-list__status' />
                                <div className='row small-11'>
                                    <div className='columns small-2'>名称</div>
                                    <div className='columns small-1'>命名空间</div>
                                    <div className='columns small-1'>已开始</div>
                                    <div className='columns small-1'>已完成</div>
                                    <div className='columns small-1'>持续时间</div>
                                    <div className='columns small-1'>进步</div>
                                    <div className='columns small-2'>信息</div>
                                    <div className='columns small-1'>详细信息</div>
                                    <div className='columns small-1'>存档</div>
                                    {(columns || []).map(col => {
                                        return (
                                            <div className='columns small-1' key={col.key}>
                                                {col.name}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* checkboxes are not visible and are unused on this page */}
                            {workflows.map(wf => {
                                return <WorkflowsRow workflow={wf} key={wf.metadata.uid} checked={false} columns={columns} onChange={null} select={null} />;
                            })}
                        </div>
                    )}
                </>
            </>
        </Page>
    );
}
