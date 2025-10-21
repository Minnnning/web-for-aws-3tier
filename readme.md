프런트엔드 (React):

nginx로 실행해서 요청을 처리합니다 `/` 루트로 온것만 프런트로 이동할 예정입니다
코드파이프라인을 통해서 실행되며 codebuild로 react 프로젝트를 빌드합니다 이후 ec2 image builder를 이용해서 ami를 생성후 시작템플릿에 반영합니다