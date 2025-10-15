백엔드 (FastAPI):

main.py의 DATABASE_URL을 직접 코드에 넣는 대신, EC2 인스턴스의 환경 변수로 설정해야 합니다. 값은 AWS RDS 생성 후 얻게 되는 엔드포인트 주소를 사용합니다.

예: postgresql://<RDS_USER>:<RDS_PASSWORD>@<RDS_ENDPOINT_URL>/<DB_NAME>

이렇게 하면 코드 변경 없이 AMI를 재사용할 수 있습니다.

프런트엔드 (React):

App.js의 API_URL 변수를 http://localhost:8000에서 백엔드 Auto Scaling Group 앞에 위치할 Application Load Balancer (ALB)의 DNS 주소로 변경해야 합니다.

변경 후 npm run build를 실행하여 정적 파일을 생성하고, 이 파일들을 서빙하도록 Nginx 등을 설정한 AMI를 프런트엔드용으로 만들면 됩니다.# for-aws-3tier
