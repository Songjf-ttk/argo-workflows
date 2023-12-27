import * as React from 'react';
import {kubernetes} from '../../../../models';
import {TextInput} from '../text-input';
import {LabelsAndAnnotationsEditor} from './labels-and-annotations-editor';

export const MetadataEditor = ({onChange, value}: {value: kubernetes.ObjectMeta; onChange: (value: kubernetes.ObjectMeta) => void}) => {
    return (
        <>
            <div className='white-box'>
                <div className='row white-box__details-row'>
                    <div className='columns small-4'>名称</div>
                    <div className='columns small-4'>
                        <TextInput onChange={name => onChange({...value, name})} value={value.name} readOnly={!!value.creationTimestamp} />
                    </div>
                </div>
                <div className='row white-box__details-row'>
                    <div className='columns small-4'>生成名称</div>
                    <div className='columns small-4'>
                        <TextInput onChange={generateName => onChange({...value, generateName})} value={value.generateName} readOnly={!!value.creationTimestamp} />
                    </div>
                </div>
            </div>
            <LabelsAndAnnotationsEditor value={value} onChange={onChange} />
        </>
    );
};
