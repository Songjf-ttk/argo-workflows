import {Page} from 'argo-ui';
import * as React from 'react';
import {useEffect, useState} from 'react';
import {GetUserInfoResponse} from '../../../models';
import {uiUrl} from '../../shared/base';
import {ErrorNotice} from '../../shared/components/error-notice';
import {Notice} from '../../shared/components/notice';
import {services} from '../../shared/services';
import {CliHelp} from './cli-help';

export function UserInfo() {
    const [error, setError] = useState<Error>(null);
    const [userInfo, setUserInfo] = useState<GetUserInfoResponse>();

    useEffect(() => {
        (async function getUserInfoWrapper() {
            try {
                const newUserInfo = await services.info.getUserInfo();
                setUserInfo(newUserInfo);
                setError(null);
            } catch (newError) {
                setError(newError);
            }
        })();
    }, []);

    return (
        <Page title='User Info' toolbar={{breadcrumbs: [{title: 'User Info'}]}}>
            <ErrorNotice error={error} />
            <Notice>
                <h3>
                    <i className='fa fa-user-alt' /> 用户信息
                </h3>
                {userInfo && (
                    <>
                        {userInfo.issuer && (
                            <dl>
                                <dt>发行人：</dt>
                                <dd>{userInfo.issuer}</dd>
                            </dl>
                        )}
                        {userInfo.subject && (
                            <dl>
                                <dt>主题：</dt>
                                <dd>{userInfo.subject}</dd>
                            </dl>
                        )}
                        {userInfo.groups && userInfo.groups.length > 0 && (
                            <dl>
                                <dt>团体：</dt>
                                <dd>{userInfo.groups.join(', ')}</dd>
                            </dl>
                        )}
                        {userInfo.name && (
                            <dl>
                                <dt>姓名：</dt>
                                <dd>{userInfo.name}</dd>
                            </dl>
                        )}
                        {userInfo.email && (
                            <dl>
                                <dt>邮箱：</dt>
                                <dd>{userInfo.email}</dd>
                            </dl>
                        )}
                        {userInfo.emailVerified && (
                            <dl>
                                <dt>电子邮件已验证：</dt>
                                <dd>{userInfo.emailVerified}</dd>
                            </dl>
                        )}
                        {userInfo.serviceAccountName && (
                            <dl>
                                <dt>服务帐号：</dt>
                                <dd>{userInfo.serviceAccountName}</dd>
                            </dl>
                        )}
                        {userInfo.serviceAccountNamespace && (
                            <dl>
                                <dt>服务帐户命名空间：</dt>
                                <dd>{userInfo.serviceAccountNamespace}</dd>
                            </dl>
                        )}
                    </>
                )}
                <a className='argo-button argo-button--base-o' href={uiUrl('login')}>
                    <i className='fa fa-shield-alt' /> 登录/登出
                </a>
            </Notice>
            <CliHelp />
        </Page>
    );
}
