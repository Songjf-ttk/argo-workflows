import {Page, SlidingPanel} from 'argo-ui';
import * as React from 'react';
import {useContext, useEffect, useState} from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';

import {WorkflowTemplate} from '../../../../models';
import {uiUrl} from '../../../shared/base';
import {ErrorNotice} from '../../../shared/components/error-notice';
import {ExampleManifests} from '../../../shared/components/example-manifests';
import {InfoIcon} from '../../../shared/components/fa-icons';
import {Loading} from '../../../shared/components/loading';
import {PaginationPanel} from '../../../shared/components/pagination-panel';
import {Timestamp} from '../../../shared/components/timestamp';
import {useCollectEvent} from '../../../shared/components/use-collect-event';
import {ZeroState} from '../../../shared/components/zero-state';
import {Context} from '../../../shared/context';
import {Footnote} from '../../../shared/footnote';
import {historyUrl} from '../../../shared/history';
import {Pagination, parseLimit} from '../../../shared/pagination';
import {ScopedLocalStorage} from '../../../shared/scoped-local-storage';
import {services} from '../../../shared/services';
import {useQueryParams} from '../../../shared/use-query-params';
import {Utils} from '../../../shared/utils';
import {WorkflowTemplateCreator} from '../workflow-template-creator';
import {WorkflowTemplateFilters} from '../workflow-template-filters/workflow-template-filters';

import './workflow-template-list.scss';

const learnMore = <a href='https://argoproj.github.io/argo-workflows/workflow-templates/'>1</a>;

export function WorkflowTemplateList({match, location, history}: RouteComponentProps<any>) {
    // boiler-plate
    const queryParams = new URLSearchParams(location.search);
    const {navigation} = useContext(Context);

    const storage = new ScopedLocalStorage('WorkflowTemplateListOptions');
    const savedOptions = storage.getItem('paginationLimit', 0);

    // state for URL and query parameters
    const [namespace, setNamespace] = useState(Utils.getNamespace(match.params.namespace) || '');
    const [sidePanel, setSidePanel] = useState(queryParams.get('sidePanel') === 'true');
    const [namePattern, setNamePattern] = useState('');
    const [labels, setLabels] = useState([]);
    const [pagination, setPagination] = useState<Pagination>({
        offset: queryParams.get('offset'),
        limit: parseLimit(queryParams.get('limit')) || savedOptions.paginationLimit || 500
    });

    useEffect(
        useQueryParams(history, p => {
            setSidePanel(p.get('sidePanel') === 'true');
        }),
        [history]
    );

    useEffect(
        () =>
            history.push(
                historyUrl('workflow-templates' + (Utils.managedNamespace ? '' : '/{namespace}'), {
                    namespace,
                    sidePanel
                })
            ),
        [namespace, sidePanel]
    );

    // internal state
    const [error, setError] = useState<Error>();
    const [templates, setTemplates] = useState<WorkflowTemplate[]>();
    useEffect(() => {
        services.workflowTemplate
            .list(namespace, labels, namePattern, pagination)
            .then(list => {
                setPagination({...pagination, nextOffset: list.metadata.continue});
                setTemplates(list.items || []);
            })
            .then(() => setError(null))
            .catch(setError);
    }, [namespace, namePattern, labels.toString(), pagination.offset, pagination.limit]); // referential equality, so use values, not refs
    useEffect(() => {
        storage.setItem('paginationLimit', pagination.limit, 0);
    }, [pagination.limit]);

    useCollectEvent('openedWorkflowTemplateList');

    return (
        <Page
            title='工作流模板'
            toolbar={{
                breadcrumbs: [
                    {title: '工作流模板', path: uiUrl('workflow-templates')},
                    {title: namespace, path: uiUrl('workflow-templates/' + namespace)}
                ],
                actionMenu: {
                    items: [
                        {
                            title: '创建新的工作流模板',
                            iconClassName: 'fa fa-plus',
                            action: () => setSidePanel(true)
                        }
                    ]
                }
            }}>
            <div className='row'>
                <div className='columns small-12 xlarge-2'>
                    <div>
                        <WorkflowTemplateFilters
                            templates={templates || []}
                            namespace={namespace}
                            namePattern={namePattern}
                            labels={labels}
                            onChange={(namespaceValue: string, namePatternValue: string, labelsValue: string[]) => {
                                setNamespace(namespaceValue);
                                setNamePattern(namePatternValue);
                                setLabels(labelsValue);
                                setPagination({...pagination, offset: ''});
                            }}
                        />
                    </div>
                </div>
                <div className='columns small-12 xlarge-10'>
                    <ErrorNotice error={error} />
                    {!templates ? (
                        <Loading />
                    ) : templates.length === 0 ? (
                        <ZeroState title='No workflow templates'>
                            <p>你可以创建新的工作流</p>
                            <p>
                                <ExampleManifests />.
                            </p>
                        </ZeroState>
                    ) : (
                        <>
                            <div className='argo-table-list'>
                                <div className='row argo-table-list__head'>
                                    <div className='columns small-1' />
                                    <div className='columns small-5'>名称</div>
                                    <div className='columns small-3'>命名域</div>
                                    <div className='columns small-3'>已创建的</div>
                                </div>
                                {templates.map(t => (
                                    <Link
                                        className='row argo-table-list__row'
                                        key={`${t.metadata.namespace}/${t.metadata.name}`}
                                        to={uiUrl(`workflow-templates/${t.metadata.namespace}/${t.metadata.name}`)}>
                                        <div className='columns small-1'>
                                            <i className='fa fa-clone' />
                                        </div>
                                        <div className='columns small-5'>{t.metadata.name}</div>
                                        <div className='columns small-3'>{t.metadata.namespace}</div>
                                        <div className='columns small-3'>
                                            <Timestamp date={t.metadata.creationTimestamp} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Footnote>
                                <InfoIcon /> 工作流程模板是可重复使用的模板，您可以从中创建新的工作流程。 <ExampleManifests />.
                            </Footnote>
                            <PaginationPanel onChange={setPagination} pagination={pagination} numRecords={null} />
                        </>
                    )}
                </div>
            </div>
            <SlidingPanel isShown={sidePanel} onClose={() => setSidePanel(false)}>
                <WorkflowTemplateCreator namespace={namespace} onCreate={wf => navigation.goto(uiUrl(`workflow-templates/${wf.metadata.namespace}/${wf.metadata.name}`))} />
            </SlidingPanel>
        </Page>
    );
}
