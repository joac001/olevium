import FeedbackWidget from './FeedbackWidget';
import WhatsAppWidget from './WhatsAppWidget';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-4 right-4 z-1100 flex flex-col items-end gap-2">
      <WhatsAppWidget />
      <FeedbackWidget />
    </div>
  );
}
