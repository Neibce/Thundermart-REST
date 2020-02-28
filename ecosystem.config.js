module.exports = {
  apps: [{
		name: 'api',
		script: './main.js',
		watch: true,
		
		env: {
			"NODE_ENV": "development" // 개발환경시 적용될 설정 지정
		},
		env_production: {
			"NODE_ENV": "production" // 배포환경시 적용될 설정 지정
		},

		instances: 0,
		exec_mode: 'cluster',
		error_file: 'err.log',
		out_file: 'out.log',
		log_file: 'combined.log',
		time: true
  }]
}