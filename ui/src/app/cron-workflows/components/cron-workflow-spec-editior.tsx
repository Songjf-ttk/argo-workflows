import {Checkbox, Select} from 'argo-ui';
import * as React from 'react';
import {ConcurrencyPolicy, CronWorkflowSpec} from '../../../models';
import {NumberInput} from '../../shared/components/number-input';
import {TextInput} from '../../shared/components/text-input';
import {ScheduleValidator} from './schedule-validator';

export function CronWorkflowSpecEditor({onChange, spec}: {spec: CronWorkflowSpec; onChange: (spec: CronWorkflowSpec) => void}) {
    return (
        <div className='white-box'>
            <div className='white-box__details'>
                <div className='row white-box__details-row'>
                    <div className='columns small-3'>日程</div>
                    <div className='columns small-9'>
                        <TextInput value={spec.schedule} onChange={schedule => onChange({...spec, schedule})} />
                        <ScheduleValidator schedule={spec.schedule} />
                    </div>
                </div>
                <div className='row white-box__details-row'>
                    <div className='columns small-3'>时间区域</div>
                    <div className='columns small-9'>
                        <TextInput value={spec.timezone} onChange={timezone => onChange({...spec, timezone})} />
                    </div>
                </div>
                <div className='row white-box__details-row'>
                    <div className='columns small-3'>并发策略</div>
                    <div className='columns small-9' style={{lineHeight: '30px'}}>
                        <Select
                            placeholder='选择并发策略'
                            options={['允许', '拒绝', '替换']}
                            value={spec.concurrencyPolicy}
                            onChange={x =>
                                onChange({
                                    ...spec,
                                    concurrencyPolicy: x.value as ConcurrencyPolicy
                                })
                            }
                        />
                    </div>
                </div>
                <div className='row white-box__details-row'>
                    <div className='columns small-3'>开始截止时间</div>
                    <div className='columns small-9'>
                        <NumberInput
                            value={spec.startingDeadlineSeconds}
                            onChange={startingDeadlineSeconds =>
                                onChange({
                                    ...spec,
                                    startingDeadlineSeconds
                                })
                            }
                        />
                    </div>
                </div>
                <div className='row white-box__details-row'>
                    <div className='columns small-3'>成功工作的历史限制</div>
                    <div className='columns small-9'>
                        <NumberInput
                            value={spec.successfulJobsHistoryLimit}
                            onChange={successfulJobsHistoryLimit =>
                                onChange({
                                    ...spec,
                                    successfulJobsHistoryLimit
                                })
                            }
                        />
                    </div>
                </div>
                <div className='row white-box__details-row'>
                    <div className='columns small-3'>失败工作的历史限制</div>
                    <div className='columns small-9'>
                        <NumberInput
                            value={spec.failedJobsHistoryLimit}
                            onChange={failedJobsHistoryLimit =>
                                onChange({
                                    ...spec,
                                    failedJobsHistoryLimit
                                })
                            }
                        />
                    </div>
                </div>
                <div className='row white-box__details-row'>
                    <div className='columns small-3'>暂停</div>
                    <div className='columns small-9'>
                        <Checkbox checked={spec.suspend} onChange={suspend => onChange({...spec, suspend})} />
                    </div>
                </div>
            </div>
        </div>
    );
}
