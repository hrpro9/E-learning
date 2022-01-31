import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'applications',
        title: 'Applications',
        translate: 'NAV.APPLICATIONS',
        type: 'group',
        children: [
            {
                id: 'sample',
                title: 'Sample',
                translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'email',
                url: '/apps/sample',
                badge: {
                    title: '25',
                    translate: 'NAV.SAMPLE.BADGE',
                    bg: '#F44336',
                    fg: '#FFFFFF'
                }
            },
            {
                id: 'file-manager',
                title: 'File Manager',
                translate: 'NAV.FILE_MANAGER',
                type: 'item',
                icon: 'folder',
                url: '/apps/file-manager'
            },
            {
                id: 'chat',
                title: 'Chat',
                translate: 'NAV.CHAT',
                type: 'item',
                icon: 'chat',
                url: '/apps/chat',
                badge: {
                    title: '13',
                    bg: '#09d261',
                    fg: '#FFFFFF'
                }
            },
        ]
    }
];
