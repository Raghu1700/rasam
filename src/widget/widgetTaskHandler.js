// Background task handler for the Android widget. Invoked by the OS for
// widget lifecycle events even when the app UI is closed.
//
//   WIDGET_ADDED / WIDGET_UPDATE / WIDGET_RESIZED → repaint with cached data
//   WIDGET_CLICK (clickAction "HEARTBEAT")        → send a heartbeat
import { StatusWidget } from './StatusWidget';
import { readWidgetData } from '../services/widgetService';
import { ensureSignedIn } from '../services/coupleService';
import { sendHeartbeat } from '../services/signalService';

export async function widgetTaskHandler(props) {
  const widgetInfo = props.widgetInfo;
  const data = (await readWidgetData()) || {};

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(<StatusWidget data={data} />);
      break;

    case 'WIDGET_CLICK':
      if (props.clickAction === 'HEARTBEAT') {
        // Re-render immediately so the tap feels responsive…
        props.renderWidget(
          <StatusWidget
            data={{ ...data, statusLabel: 'Heart sent 💗' }}
          />
        );
        // …then fire the heartbeat in the background.
        try {
          if (data.coupleId && data.partnerUid) {
            await ensureSignedIn();
            await sendHeartbeat(
              data.coupleId,
              data.uid,
              data.myName,
              data.partnerUid
            );
          }
        } catch (e) {
          console.warn('widget heartbeat failed:', e);
        }
        // Restore the normal view shortly after.
        props.renderWidget(<StatusWidget data={data} />);
      }
      break;

    case 'WIDGET_DELETED':
    default:
      break;
  }
}
