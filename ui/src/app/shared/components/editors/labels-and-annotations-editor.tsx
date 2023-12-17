import * as React from 'react';
import {kubernetes} from '../../../../models';
import {KeyValueEditor} from './key-value-editor';

export const LabelsAndAnnotationsEditor = ({value, onChange}: {value: kubernetes.ObjectMeta; onChange: (value: kubernetes.ObjectMeta) => void}) => {
    return (
        <>
            <div className='white-box'>
                <h5>标签</h5>
                <KeyValueEditor keyValues={value && value.labels} onChange={labels => onChange({...value, labels})} />
            </div>
            <div className='white-box'>
                <h5>注释</h5>
                <KeyValueEditor
                    keyValues={value && value.annotations}
                    onChange={annotations => onChange({...value, annotations})}
                    hide={key => key === 'kubectl.kubernetes.io/last-applied-configuration'}
                />
            </div>
        </>
    );
};
