import {Page, SlidingPanel} from 'argo-ui';
import * as React from 'react';
import {useContext, useEffect, useState} from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';
import * as models from '../../../../models';
import {uiUrl} from '../../../shared/base';
import {ErrorNotice} from '../../../shared/components/error-notice';
import {ExampleManifests} from '../../../shared/components/example-manifests';
import {InfoIcon} from '../../../shared/components/fa-icons';
import {Loading} from '../../../shared/components/loading';
import {Timestamp} from '../../../shared/components/timestamp';
import {useCollectEvent} from '../../../shared/components/use-collect-event';
import {ZeroState} from '../../../shared/components/zero-state';
import {Context} from '../../../shared/context';
import {useQueryParams} from '../../../shared/use-query-params';

import {Footnote} from '../../../shared/footnote';
import {services} from '../../../shared/services';
import {ClusterWorkflowTemplateCreator} from '../cluster-workflow-template-creator';

import './cluster-workflow-template-list.scss';

export function ClusterWorkflowTemplateList({history, location}: RouteComponentProps<any>) {
    const {navigation} = useContext(Context);
    const queryParams = new URLSearchParams(location.search);
    const [templates, setTemplates] = useState<models.ClusterWorkflowTemplate[]>();
    const [error, setError] = useState<Error>();
    const [sidePanel, setSidePanel] = useState(queryParams.get('sidePanel'));

    async function fetchClusterWorkflowTemplates() {
        try {
            const retrievedTemplates = await services.clusterWorkflowTemplate.list();
            setTemplates(retrievedTemplates);
            setError(null);
        } catch (err) {
            setError(err);
        }
    }

    useEffect(
        useQueryParams(history, p => {
            setSidePanel(p.get('sidePanel'));
        }),
        [history]
    );

    useEffect(() => {
        fetchClusterWorkflowTemplates();
    }, []);

    useCollectEvent('openedClusterWorkflowTemplateList');

    function renderTemplates() {
        if (error) {
            return <ErrorNotice error={error} />;
        }
        if (!templates) {
            return <Loading />;
        }
        if (templates.length === 0) {
            return (
                <ZeroState title='没有集群工作流模板'>
                    <p>可以在这里创建新的工作流模板</p>
                    <p>
                        <ExampleManifests />.
                    </p>
                </ZeroState>
            );
        }
        return (
            <>
                <div className='argo-table-list'>
                    <div className='row argo-table-list__head'>
                        <div className='columns small-1' />
                        <div className='columns small-5'>名称</div>
                        <div className='columns small-3'>已创建的</div>
                    </div>
                    {templates.map(t => (
                        <Link className='row argo-table-list__row' key={t.metadata.uid} to={uiUrl(`cluster-workflow-templates/${t.metadata.name}`)}>
                            <div className='columns small-1'>
                                <i className='fa fa-clone' />
                            </div>
                            <div className='columns small-5'>{t.metadata.name}</div>
                            <div className='columns small-3'>
                                <Timestamp date={t.metadata.creationTimestamp} />
                            </div>
                        </Link>
                    ))}
                </div>
                <Footnote>
                    <InfoIcon /> 集群范围的工作流模板是可重用的模板，你可以从中创建新的工作流。<ExampleManifests />.
                </Footnote>
            </>
        );
    }

    return (
        <Page
            title='集群工作流模板'
            toolbar={{
                breadcrumbs: [{title: '集群工作流模板', path: uiUrl('cluster-workflow-templates')}],
                actionMenu: {
                    items: [
                        {
                            title: '创建新的集群工作流模板',
                            iconClassName: 'fa fa-plus',
                            action: () => setSidePanel('new')
                        }
                    ]
                }
            }}>
            {renderTemplates()}
            <SlidingPanel isShown={sidePanel !== null} onClose={() => setSidePanel(null)}>
                <ClusterWorkflowTemplateCreator onCreate={wf => navigation.goto(uiUrl(`cluster-workflow-templates/${wf.metadata.name}`))} />
            </SlidingPanel>
        </Page>
    );
}
