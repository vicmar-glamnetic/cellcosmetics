import './public-path';

import '../styles/checkout.scss';
import OneMarketing from '@/modules/module-oneMarketing';

if (ORW.enableGTM) {
    ORW.marketing = ORW.marketing || new OneMarketing;
    ORW.marketing.checkoutEvents();
}