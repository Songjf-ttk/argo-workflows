import x from 'cronstrue';
import * as React from 'react';

import {SuccessIcon, WarningIcon} from '../../shared/components/fa-icons';

export function ScheduleValidator({schedule}: {schedule: string}) {
    try {
        if (schedule.split(' ').length >= 6) {
            throw new Error('cron 计划必须仅包含 5 个值');
        }
        return (
            <span>
                <SuccessIcon /> {x.toString(schedule)}
            </span>
        );
    } catch (e) {
        return (
            <span>
                <WarningIcon /> 时间表可能无效： {e.toString()}
            </span>
        );
    }
}
