import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { ProviderRoutes } from '../app/modules/provider/provider.route';
import { SubcategoryRoutes } from '../app/modules/subcategory/subcategory.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { FaqRoutes } from '../app/modules/faq/faq.routes';
import { AdminRoutes } from '../app/modules/admin/admin.routes';
import { RuleRoutes } from '../app/modules/rule/rule.route';
import { ChatRoutes } from '../app/modules/chat/chat.routes';
import { MessageRoutes } from '../app/modules/message/message.routes';
import { ServiceListRoute } from '../app/modules/serviceList/serviceList.route';
import { ReportRoutes } from '../app/modules/report/report.route';
import { ReviewRoutes } from '../app/modules/review/review.routes';
import { BookmarkRoutes } from '../app/modules/bookmark/bookmark.routes';
import { PaymentRoutes } from '../app/modules/payment/payment.routes';
import { BookingRoutes } from '../app/modules/booking/booking.routes';
import { ScheduleRoutes } from '../app/modules/schedule/schedule.routes';
import { NotificationRoutes } from '../app/modules/notification/notification.routes';
const router = express.Router();

const apiRoutes = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/provider', route: ProviderRoutes },
  { path: '/category', route: CategoryRoutes },
  { path: '/subcategory', route: SubcategoryRoutes },
  { path: '/faq', route: FaqRoutes },
  { path: '/rule', route: RuleRoutes },
  { path: '/message', route: MessageRoutes },
  { path: '/admin', route: AdminRoutes },
  { path: '/serviceList', route: ServiceListRoute },
  { path: '/report', route: ReportRoutes },
  { path: '/review', route: ReviewRoutes },
  { path: '/bookmark', route: BookmarkRoutes },
  { path: '/chat', route: ChatRoutes },
  { path: '/payment', route: PaymentRoutes },
  { path: '/booking', route: BookingRoutes },
  { path: '/schedule', route: ScheduleRoutes },
  { path: '/notification', route: NotificationRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
