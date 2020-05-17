module.exports = {
  apps: [
    {
      name: "buddy-19",
      script: "npm",
      args: "start",
      // exec_mode: "cluster",
      // instances: "max",
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],

  deploy: {
    production: {
      user: "ubuntu",
      host: "ec2-13-115-214-1.ap-northeast-1.compute.amazonaws.com",
      key: "../_deployment/ec2_umu.to.pem",
      ref: "origin/release",
      repo: "git@github.com:umutto/buddy-19.git",
      path: "/home/ubuntu/projects/buddy-19",
      "post-deploy": "npm ci && pm2 startOrRestart ecosystem.config.js",
    },
  },
};
