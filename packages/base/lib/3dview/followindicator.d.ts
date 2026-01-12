import * as React from 'react';
import { User } from '@jupyterlab/services';
interface IProps {
    remoteUser: User.IIdentity | null | undefined;
}
export declare function FollowIndicator(props: IProps): React.JSX.Element | null;
export {};
