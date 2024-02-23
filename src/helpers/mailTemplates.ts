import moment from 'moment'
import { paramsStringify } from './queryParams'
import { IUser } from '../types/user.type'

const getVerificationEmailTemplate = ({
	redirectDomain,
	user,
	token
}: {
	redirectDomain: string
	user: Pick<IUser, 'email' | 'displayName' | 'role'>
	token: string
}) => {
	return {
		to: user.email,
		subject: 'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Yên Nghĩa',
		html: /* html */ `
			<div>
				<p>
					Thân gửi ${user.displayName}!
					<p>
						Người dùng nhận được mail vui lòng click vào <a href='${
							redirectDomain + '/api/auth/verify-account' + paramsStringify({ _role: user.role, _token: token })
						}'>link</a> này để xác thực tài khoản.
					</p>
					<i>Lưu ý: Mail xác thực này có hiệu lực trong vòng 7 ngày</i>
				</p>
				<hr>
				<p>
					<span style="display: block">Trân trọng!</span>
					<i>Tiểu học Yên Nghĩa</i>
				</p>
			</div>
					`
	}
}

const getDeactivateUserEmail = (user: Pick<IUser, '_id' | 'email'>) => {
	return {
		to: user.email,
		subject: 'Tiểu học  thông báo vô hiệu hóa tài khoản người dùng.',
		html: /* html */ `
       <h4>Trường tiểu Học Yên Nghĩa thông báo.</h4>
       <p>
         Tài khoản của bạn đã bị vô hiệu hóa kể từ ngày ${moment().format('DD/MM/YYYY')}.
         Nếu có bất kỳ thắc mắc vui lòng liên hệ cho nhà trường theo số điện thoại 0xxx.xxx.xxx
         <hr style="width: 100%; height: 0.5px; background: #d1d5db">
         <i>Lưu ý: Đây là mail tự động, vui lòng không trả lời mail này.</i>
         <br>
         <b>Trân trọng</b>
         <br>
         <i>Trường tiểu học Yên Nghĩa</i>
       </p>
      `
	}
}

// export default get;

export { getVerificationEmailTemplate, getDeactivateUserEmail }
