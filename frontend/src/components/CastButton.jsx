import { useEffect } from 'react';
import { routes } from '../utils/constants';

const CastButton = () => {
    useEffect(() => {
        window.__onGCastApiAvailable = function (isAvailable) {
            console.log('Cast SDK available:', isAvailable);
            if (isAvailable) {
                const castContext = cast.framework.CastContext.getInstance();
                castContext.setOptions({
                    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
                });

                castContext.addEventListener(
                    cast.framework.CastContextEventType.CAST_STATE_CHANGED,
                    (event) => {
                        if (event.sessionState === cast.framework.SessionState.SESSION_STARTED) {
                            const session = castContext.getCurrentSession();
                            if (session) {
                                session.loadMedia(new chrome.cast.media.LoadRequest({
                                    contentId: routes.ordersstate,
                                    contentType: 'application/json',
                                }));
                            }
                        }
                    }
                );
            }
        };
    }, []);

    return (
        <div style={{ position: 'fixed', top: 10, right: 10 }}>
            <google-cast-launcher
                style={{
                    width: 18,
                    height: 18,
                    '--connected-color': '#28a745',
                    '--disconnected-color': '#007bff',
                }}
            />
        </div>
    );
};

export default CastButton;
